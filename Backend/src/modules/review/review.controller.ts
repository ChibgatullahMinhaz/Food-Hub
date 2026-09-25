import type { RequestHandler } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from "http-status";
import * as reviewService from "./review.service";
import { Role } from "@/prisma/generated/prisma/enums";
import type { TGetReviewsQueryInput } from "./review.validation";
import ApiError from "@/errors/ApiError";

export const createReview: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const result = await reviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review posted successfully",
    data: result,
  });
});

export const getMealReviews: RequestHandler = catchAsync(async (req, res) => {
  const { mealId } = req.params;
  const query = req.query as unknown as TGetReviewsQueryInput;
  if (!mealId || typeof mealId !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Id Format !")
  }
  const result = await reviewService.getMealReviews(mealId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meal reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const getProviderReviews: RequestHandler = catchAsync(async (req, res) => {
  const { providerId } = req.params;
  const query = req.query as unknown as TGetReviewsQueryInput;
  if (!providerId || typeof providerId !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Id Format !")
  }

  const result = await reviewService.getProviderReviews(providerId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const updateReview: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  if (!id || typeof id !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Id Format !")
  }
  const result = await reviewService.updateReview(id, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

export const deleteReview: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const isAdmin = req.user?.role === Role.ADMIN;
  if (!id || typeof id !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Id Format !")
  }
  const result = await reviewService.deleteReview(id, userId, isAdmin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});