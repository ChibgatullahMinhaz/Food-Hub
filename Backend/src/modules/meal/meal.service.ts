import httpStatus from "http-status";
import type {
  TCreateMealInput,
  TUpdateMealInput,
  TGetMealQueryInput,
} from "./meal.validation";
import { prisma } from "@/lib/prisma";
import ApiError from "@/errors/ApiError";
import type { Prisma } from "@/prisma/generated/prisma/client";
import { createMealStorageKey, generateSlug } from "@/utils/storageKey";
import { getPresignedDownloadUrl, uploadBufferToR2 } from "@/utils/r2";

export const createMeal = async (
  userId: string,
  payload: TCreateMealInput,
  files: Express.Multer.File[],
) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!providerProfile) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must have a Provider Profile to create meals",
    );
  }
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  const isDuplicate = await prisma.meal.findFirst({
    where: {
      providerId: providerProfile.id,
      name: payload.name,
    },
    select: { id: true },
  });

  if (isDuplicate) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A meal with this name already exists in your menu",
    );
  }

  let updatedImages: string[] | undefined = undefined;

  if (files && files.length > 0) {
    const slug = generateSlug(payload.name);
    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const storageKey = createMealStorageKey(file, slug);
        return await uploadBufferToR2(storageKey, file.buffer, file.mimetype);
      }),
    );
    updatedImages = uploadedUrls;
  }

  return await prisma.meal.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      categoryId: payload.categoryId,
      providerId: providerProfile.id,
      ...(updatedImages && { images: updatedImages }),
      ...(payload.isAvailable !== undefined && {
        isAvailable: payload.isAvailable,
      }),
      ...(payload.isVegetarian !== undefined && {
        isVegetarian: payload.isVegetarian,
      }),
      ...(payload.dietaryType && { dietaryType: payload.dietaryType }),
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          restaurantName: true,
          address: true,
        },
      },
    },
  });
};

export const getAllMeals = async (query: TGetMealQueryInput) => {
  const {
    cursor,
    limit = 10,
    search,
    categoryId,
    providerId,
    isAvailable,
    isVegetarian,
    dietaryType,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const whereConditions: Prisma.MealWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(providerId && { providerId }),
    ...(isAvailable !== undefined && { isAvailable }),
    ...(isVegetarian !== undefined && { isVegetarian }),
    ...(dietaryType && {
      dietaryType: { contains: dietaryType, mode: "insensitive" },
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const meals = await prisma.meal.findMany({
    where: whereConditions,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor } }),
    skip: cursor ? 1 : 0,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      provider: {
        select: {
          id: true,
          restaurantName: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (meals.length > limit) {
    const nextItem = meals.pop();
    nextCursor = nextItem?.id || null;
  }

  const mealsWithPresignedUrls = await Promise.all(
    meals.map(async (meal) => ({
      ...meal,
      images: await Promise.all(
        meal.images.map((imageKey) => getPresignedDownloadUrl(imageKey)),
      ),
    })),
  );

  return {
    meta: {
      limit,
      nextCursor,
      hasMore: !!nextCursor,
    },
    data: mealsWithPresignedUrls,
  };
};

export const getMealById = async (id: string) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          restaurantName: true,
          address: true,
          phone: true,
        },
      },
    },
  });

  if (!meal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meal not found");
  }

  return {
    ...meal,
    images: await Promise.all(
      meal.images.map((imageKey) => getPresignedDownloadUrl(imageKey)),
    ),
  };
};

export const updateMeal = async (
  id: string,
  userId: string,
  isAdmin: boolean,
  payload: TUpdateMealInput,
  files?: Express.Multer.File[],
) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
  });

  if (!meal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meal not found");
  }

  if (!isAdmin) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!providerProfile || meal.providerId !== providerProfile.id) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to update this meal",
      );
    }
  }

  if (payload.categoryId && payload.categoryId !== meal.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }
  }

  if (payload.name && payload.name !== meal.name) {
    const isDuplicate = await prisma.meal.findFirst({
      where: {
        id: { not: id },
        providerId: meal.providerId,
        name: payload.name,
      },
      select: { id: true },
    });

    if (isDuplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "You already have a meal with this name",
      );
    }
  }

  let updatedImages: string[] | undefined = undefined;
  if (files && files.length > 0) {
    const slug = payload.name
      ? generateSlug(payload.name)
      : generateSlug(meal.name);
    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const storageKey = createMealStorageKey(file, slug);
        return await uploadBufferToR2(storageKey, file.buffer, file.mimetype);
      }),
    );
    updatedImages = uploadedUrls;
  }

  return await prisma.meal.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.price !== undefined && { price: payload.price }),
      ...(payload.categoryId && { categoryId: payload.categoryId }),
      ...(updatedImages && { images: updatedImages }),
      ...(payload.isAvailable !== undefined && {
        isAvailable: payload.isAvailable,
      }),
      ...(payload.isVegetarian !== undefined && {
        isVegetarian: payload.isVegetarian,
      }),
      ...(payload.dietaryType !== undefined && {
        dietaryType: payload.dietaryType,
      }),
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          restaurantName: true,
        },
      },
    },
  });
};

export const deleteMeal = async (
  id: string,
  userId: string,
  isAdmin: boolean,
) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
  });

  if (!meal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meal not found");
  }

  if (!isAdmin) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile || meal.providerId !== providerProfile.id) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to delete this meal",
      );
    }
  }

  return await prisma.meal.delete({
    where: { id },
  });
};
