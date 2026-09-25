import type { RequestHandler } from "express";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import httpStatus from "http-status";
import * as cartService from "./cart.service";

export const addToCart: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const result = await cartService.addToCart(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item added to cart successfully",
    data: result,
  });
});

export const getMyCart: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const result = await cartService.getMyCart(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart fetched successfully",
    data: result,
  });
});

export const updateCartItemQuantity: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const { itemId } = req.params;
  const result = await cartService.updateCartItemQuantity(userId, itemId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

export const removeCartItem: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const { itemId } = req.params;
  const result = await cartService.removeCartItem(userId, itemId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item removed from cart successfully",
    data: result,
  });
});

export const clearCart: RequestHandler = catchAsync(async (req, res) => {
  const userId = req.user!.id;
  const result = await cartService.clearCart(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart cleared successfully",
    data: result,
  });
});