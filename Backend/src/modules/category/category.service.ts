import httpStatus from "http-status";
import type {
  TCreateCategoryInput,
  TGetCategoryQueryInput,
  TUpdateCategoryInput,
} from "./category.validation";
import ApiError from "@/errors/ApiError";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";
import {
  deleteFromR2,
  getPresignedDownloadUrl,
  uploadBufferToR2,
} from "@/utils/r2";
import { createCategoryStorageKey, generateSlug } from "@/utils/category";

export const createCategory = async (
  payload: TCreateCategoryInput,
  file?: Express.Multer.File,
) => {
  const slug = generateSlug(payload.name);

  const isExist = await prisma.category.findFirst({
    where: {
      OR: [{ name: payload.name }, { slug }],
    },
  });

  if (isExist) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Category with this name already exists",
    );
  }
  let imageUrl: string | undefined;

  if (file) {
    const storageKey = createCategoryStorageKey(file, slug);
    imageUrl = await uploadBufferToR2(storageKey, file.buffer, file.mimetype);
  }

  return await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      ...(imageUrl && { image: imageUrl }),
    },
  });
};

export const getAllCategories = async (query: TGetCategoryQueryInput) => {
  const { cursor, limit = 10, search, sortOrder = "desc" } = query;

  const whereConditions: Prisma.CategoryWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const categories = await prisma.category.findMany({
    where: whereConditions,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor } }),
    skip: cursor ? 1 : 0,
    orderBy: {
      createdAt: sortOrder,
    },
    include: {
      _count: {
        select: { meals: true },
      },
    },
  });

  let nextCursor: string | null = null;

  if (categories.length > limit) {
    const nextItem = categories.pop();
    nextCursor = nextItem?.id || null;
  }

  const categoriesWithPresignedUrls = await Promise.all(
    categories.map(async (category) => {
      return {
        ...category,
        image: category.image
          ? await getPresignedDownloadUrl(category.image)
          : null,
      };
    }),
  );

  return {
    meta: {
      limit,
      nextCursor,
      hasMore: !!nextCursor,
    },
    data: categoriesWithPresignedUrls,
  };
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return {
    ...category,
    image: category.image
      ? await getPresignedDownloadUrl(category.image)
      : null,
  };
};

export const updateCategory = async (
  id: string,
  payload: TUpdateCategoryInput,
  file?: Express.Multer.File,
) => {
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  const newSlug = payload.name ? generateSlug(payload.name) : undefined;

  if (payload.name && newSlug) {
    const isDuplicate = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: payload.name }, { slug: newSlug }],
      },
    });

    if (isDuplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Category with this name already exists",
      );
    }
  }

  let newImageKey: string | undefined;
  if (file) {
    const storageKey = createCategoryStorageKey(
      file,
      newSlug || existingCategory.slug,
    );
    newImageKey = await uploadBufferToR2(
      storageKey,
      file.buffer,
      file.mimetype,
    );
  }
  const updateData: Prisma.CategoryUpdateInput = {};

  if (payload.name && newSlug) {
    updateData.name = payload.name;
    updateData.slug = newSlug;
  }

  if (newImageKey) {
    updateData.image = newImageKey;
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    if (newImageKey && existingCategory.image) {
      deleteFromR2(existingCategory.image).catch(() => {});
    }

    return {
      ...updatedCategory,
      image: updatedCategory.image
        ? await getPresignedDownloadUrl(updatedCategory.image)
        : null,
    };
  } catch (error) {
    if (newImageKey) {
      await deleteFromR2(newImageKey).catch(() => {});
    }
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { meals: true } },
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (category._count.meals > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category with associated meals",
    );
  }

  return await prisma.category.delete({
    where: { id },
  });
};
