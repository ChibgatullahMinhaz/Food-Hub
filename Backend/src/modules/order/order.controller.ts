import type { RequestHandler } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from "http-status";
import * as orderService from "./order.service";
import { Role } from "@/prisma/generated/prisma/enums";
import type { TGetOrdersQueryInput } from "./order.validation";

export const createOrder: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const result = await orderService.createOrderFromCart(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

export const getMyOrders: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const query = req.query as unknown as TGetOrdersQueryInput;
  const result = await orderService.getMyOrders(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer orders fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const getProviderOrders: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const isAdmin = req.user?.role === Role.ADMIN;
  const query = req.query as unknown as TGetOrdersQueryInput;

  const result = await orderService.getProviderOrders(userId, isAdmin, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider orders fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const getOrderById: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const isAdmin = req.user?.role === Role.ADMIN;

  const result = await orderService.getOrderById(id, userId, isAdmin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details fetched successfully",
    data: result,
  });
});

export const updateOrderStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const isAdmin = req.user?.role === Role.ADMIN;

  const result = await orderService.updateOrderStatus(
    id,
    userId,
    isAdmin,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

export const cancelOrder: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const result = await orderService.cancelOrder(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled successfully",
    data: result,
  });
});