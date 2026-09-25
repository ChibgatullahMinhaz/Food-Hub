import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
} from "./cart.validation";
import {
  addToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "./cart.controller";

const cartRoutes:Router = Router();

// All cart endpoints require authentication
cartRoutes.use(requireAuth);

cartRoutes.get("/", getMyCart);

cartRoutes.post(
  "/items",
  validateRequest(addToCartSchema),
  addToCart
);

cartRoutes.patch(
  "/items/:itemId",
  validateRequest(updateCartItemSchema),
  updateCartItemQuantity
);

cartRoutes.delete(
  "/items/:itemId",
  validateRequest(cartItemIdParamSchema),
  removeCartItem
);

cartRoutes.delete("/", clearCart);

export default cartRoutes;