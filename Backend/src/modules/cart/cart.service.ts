import httpStatus from "http-status";
import type { TAddToCartInput, TUpdateCartItemInput } from "./cart.validation";
import { prisma } from "@/lib/prisma";
import ApiError from "@/errors/ApiError";

export const addToCart = async (userId: string, payload: TAddToCartInput) => {
  const { mealId, quantity } = payload;

  // 1. Verify meal exists and is available
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
  });

  if (!meal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meal not found");
  }

  if (!meal.isAvailable) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This meal is currently unavailable");
  }

  // 2. Find or create user cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // 3. Upsert cart item
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_mealId: {
        cartId: cart.id,
        mealId,
      },
    },
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
      include: {
        meal: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            providerId: true,
          },
        },
      },
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      mealId,
      quantity,
    },
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          providerId: true,
        },
      },
    },
  });
};

export const getMyCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          meal: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              isAvailable: true,
              provider: {
                select: {
                  id: true,
                  restaurantName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      id: null,
      items: [],
      subtotal: 0,
    };
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.meal.price * item.quantity,
    0
  );

  return {
    ...cart,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

export const updateCartItemQuantity = async (
  userId: string,
  itemId: string,
  payload: TUpdateCartItemInput
) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  return await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity: payload.quantity,
    },
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  });
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  return await prisma.cartItem.delete({
    where: { id: itemId },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    return { message: "Cart is already empty" };
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return { message: "Cart cleared successfully" };
};