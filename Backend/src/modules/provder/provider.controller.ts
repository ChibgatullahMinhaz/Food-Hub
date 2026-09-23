import type { RequestHandler } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from "http-status";
import * as providerService from "./provider.service";
import ApiError from "@/errors/ApiError";
import type { GetProviderQueryInput } from "./provider.validation";

export const applyForProvider: RequestHandler = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'please Login First...! ')
    }
    const userId = req.user.id;
    const result = await providerService.applyForProvider(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Provider application submitted successfully. Pending admin approval.",
        data: result,
    });
});

export const changeProviderStatus: RequestHandler = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || typeof id !== 'string') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or missing User ID");
    }
    const result = await providerService.updateProviderStatus(id, status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Provider application has been ${status.toLowerCase()} successfully.`,
        data: result,
    });
});

export const getAllProviders:RequestHandler = catchAsync(async (req, res) => {
    const query = req.query as unknown as GetProviderQueryInput;
  const result = await providerService.getAllProviders(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Providers fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});