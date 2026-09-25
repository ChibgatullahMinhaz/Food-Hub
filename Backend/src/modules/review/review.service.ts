import httpStatus from "http-status";
import type { TCreateReviewInput, TGetReviewsQueryInput, TUpdateReviewInput } from "./review.validation";
import { prisma } from "@/lib/prisma";
import ApiError from "@/errors/ApiError";
import type { Prisma } from "@/prisma/generated/prisma/client";


export const createReview = async (
    userId: string,
    payload: TCreateReviewInput
) => {
    const { mealId, orderId, rating, comment } = payload;

    // 1. Verify Meal Exists
    const meal = await prisma.meal.findUnique({
        where: { id: mealId },
    });

    if (!meal) {
        throw new ApiError(httpStatus.NOT_FOUND, "Meal not found");
    }

    // 2. Verified Purchase Check (If orderId is provided)
    if (orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
        }

        if (order.customerId !== userId) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                "You can only review meals from your own orders"
            );
        }

        const hasOrderedMeal = order.items.some(
            (item) => item.mealId === mealId
        );

        if (!hasOrderedMeal) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "This meal is not included in the specified order"
            );
        }
    }

    // 3. Check duplicate review
    const existingReview = await prisma.review.findFirst({
        where: {
            customerId: userId,
            mealId,
            orderId: orderId || null,
        },
    });

    if (existingReview) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "You have already reviewed this meal for this order"
        );
    }

    // 4. Create Review
    return await prisma.review.create({
        data: {
            customerId: userId,
            mealId,
            orderId: orderId || null,
            rating,
            comment,
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                },
            },
            meal: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const getMealReviews = async (
    mealId: string,
    query: TGetReviewsQueryInput
) => {
    const { cursor, limit = 10 } = query;

    const reviews = await prisma.review.findMany({
        where: { mealId },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    // Calculate Average Rating & Stats
    const aggregateResult = await prisma.review.aggregate({
        where: { mealId },
        _avg: { rating: true },
        _count: { id: true },
    });

    let nextCursor: string | null = null;
    if (reviews.length > limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem?.id || null;
    }

    return {
        meta: {
            limit,
            nextCursor,
            hasMore: !!nextCursor,
            totalReviews: aggregateResult._count.id,
            averageRating: Number((aggregateResult._avg.rating || 0).toFixed(1)),
        },
        data: reviews,
    };
};

export const getProviderReviews = async (
    providerId: string,
    query: TGetReviewsQueryInput
) => {
    const { cursor, limit = 10 } = query;

    const reviews = await prisma.review.findMany({
        where: {
            meal: {
                providerId,
            },
        },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                },
            },
            meal: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    const aggregateResult = await prisma.review.aggregate({
        where: {
            meal: {
                providerId,
            },
        },
        _avg: { rating: true },
        _count: { id: true },
    });

    let nextCursor: string | null = null;
    if (reviews.length > limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem?.id || null;
    }

    return {
        meta: {
            limit,
            nextCursor,
            hasMore: !!nextCursor,
            totalReviews: aggregateResult._count.id,
            averageRating: Number((aggregateResult._avg.rating || 0).toFixed(1)),
        },
        data: reviews,
    };
};

export const updateReview = async (
    reviewId: string,
    userId: string,
    payload: TUpdateReviewInput
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
    }

    if (review.customerId !== userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You can only update your own review"
        );
    }
    const updateData: Prisma.ReviewUpdateInput = {};
    if (payload.rating !== undefined) updateData.rating = payload.rating;
    if (payload.comment !== undefined) updateData.comment = payload.comment;
    
    return await prisma.review.update({
        where: { id: reviewId },
        data: updateData,
    });
};

export const deleteReview = async (
    reviewId: string,
    userId: string,
    isAdmin: boolean
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
    }

    if (!isAdmin && review.customerId !== userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You can only delete your own review"
        );
    }

    return await prisma.review.delete({
        where: { id: reviewId },
    });
};