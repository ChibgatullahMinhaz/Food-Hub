import type { RequestHandler } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from "http-status";
import * as mealService from "./meal.service";
import type { TGetMealQueryInput } from "./meal.validation";
import { Role } from "@/prisma/generated/prisma/enums";
import ApiError from "@/errors/ApiError";

export const createMeal: RequestHandler = catchAsync(async (req, res) => {
    const userId = req.user?.id;

    if (!userId || typeof userId !== "string") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid id Formar")
    }

    const result = await mealService.createMeal(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Meal created successfully",
        data: result,
    });
});

export const getAllMeals: RequestHandler = catchAsync(async (req, res) => {
    const query = req.query as unknown as TGetMealQueryInput;
    const result = await mealService.getAllMeals(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meals fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const getMealById: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID Format !")
    }
    const result = await mealService.getMealById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meal fetched successfully",
        data: result,
    });
});

export const updateMeal: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID Format !")
    }
    const userId = req.user!.id;
    const isAdmin = req.user?.role === Role.ADMIN;
    const result = await mealService.updateMeal(
        id,
        userId,
        isAdmin,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meal updated successfully",
        data: result,
    });
});

export const deleteMeal: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user?.role === Role.ADMIN;
    if (!id || typeof id !== 'string') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID Format !")
    }

    const result = await mealService.deleteMeal(
        id,
        userId,
        isAdmin
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meal deleted successfully",
        data: result,
    });
});