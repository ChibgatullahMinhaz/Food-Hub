import httpStatus from "http-status";
import type { TCreateCategoryInput, TGetCategoryQueryInput, TUpdateCategoryInput } from "./category.validation";
import ApiError from "@/errors/ApiError";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";

const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const createCategory = async (payload: TCreateCategoryInput) => {
    const slug = generateSlug(payload.name);

    const isExist = await prisma.category.findFirst({
        where: {
            OR: [{ name: payload.name }, { slug }],
        },
    });

    if (isExist) {
        throw new ApiError(httpStatus.CONFLICT, "Category with this name already exists");
    }

    return await prisma.category.create({
        data: {
            name: payload.name,
            slug,
            ...(payload.image && { image: payload.image }),
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

    return {
        meta: {
            limit,
            nextCursor,
            hasMore: !!nextCursor,
        },
        data: categories,
    };
};

export const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    return category;
};

export const updateCategory = async (
  id: string,
  payload: TUpdateCategoryInput
) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (payload.name) {
    const slug = generateSlug(payload.name);

    const isExist = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ name: payload.name }, { slug }] },
        ],
      },
    });

    if (isExist) {
      throw new ApiError(httpStatus.CONFLICT, "Category with this name already exists");
    }
  }

  return await prisma.category.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name, slug: generateSlug(payload.name) }),
      ...(payload.image !== undefined && { image: payload.image }),
    },
  });
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
            "Cannot delete category with associated meals"
        );
    }

    return await prisma.category.delete({
        where: { id },
    });
};