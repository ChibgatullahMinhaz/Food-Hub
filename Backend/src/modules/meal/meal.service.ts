
import httpStatus from "http-status";
import type {
  TCreateMealInput,
  TUpdateMealInput,
  TGetMealQueryInput,
} from "./meal.validation";
import { prisma } from "@/lib/prisma";
import ApiError from "@/errors/ApiError";
import type { Prisma } from "@/prisma/generated/prisma/client";

export const createMeal = async (
  userId: string,
  payload: TCreateMealInput
) => {

  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!providerProfile) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must have a Provider Profile to create meals"
    );
  }
  const targetProviderId = payload.providerId || providerProfile.id;
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  return await prisma.meal.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      categoryId: payload.categoryId,
      providerId: targetProviderId,
      ...(payload.image && { image: payload.image }),
      ...(payload.isAvailable !== undefined && { isAvailable: payload.isAvailable }),
      ...(payload.isVegetarian !== undefined && { isVegetarian: payload.isVegetarian }),
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

  return {
    meta: {
      limit,
      nextCursor,
      hasMore: !!nextCursor,
    },
    data: meals,
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

  return meal;
};

export const updateMeal = async (
  id: string,
  userId: string,
  isAdmin: boolean,
  payload: TUpdateMealInput
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
        "You do not have permission to update this meal"
      );
    }
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }
  }

  return await prisma.meal.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.price !== undefined && { price: payload.price }),
      ...(payload.categoryId && { categoryId: payload.categoryId }),
      ...(payload.image !== undefined && { image: payload.image }),
      ...(payload.isAvailable !== undefined && { isAvailable: payload.isAvailable }),
      ...(payload.isVegetarian !== undefined && { isVegetarian: payload.isVegetarian }),
      ...(payload.dietaryType !== undefined && { dietaryType: payload.dietaryType }),
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
  isAdmin: boolean
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
        "You do not have permission to delete this meal"
      );
    }
  }

  return await prisma.meal.delete({
    where: { id },
  });
};