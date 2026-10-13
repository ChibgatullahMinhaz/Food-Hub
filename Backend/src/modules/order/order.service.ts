import httpStatus from "http-status";
import { OrderStatus } from "@/prisma/generated/prisma/enums";
import type { TCreateOrderInput, TGetOrdersQueryInput, TUpdateOrderStatusInput } from "./order.validation";
import { prisma } from "@/lib/prisma";
import ApiError from "@/errors/ApiError";
import type { Prisma } from "@/prisma/generated/prisma/client";
import { getPresignedDownloadUrl } from "@/utils/r2";

const withSignedMealImages = async <T extends { images: string[] }>(
  meal: T,
) => ({
  ...meal,
  images: await Promise.all(meal.images.map(getPresignedDownloadUrl)),
});

const withSignedOrderItemMealImages = async <
  T extends { meal: { images: string[] } },
>(
  item: T,
) => ({
  ...item,
  meal: await withSignedMealImages(item.meal),
});


// Unique Order Number Generator (e.g. ORD-20260925-8492)
const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomNum}`;
};

export const createOrderFromCart = async (
  userId: string,
  payload: TCreateOrderInput
) => {
  // 1. Fetch Cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your cart is empty");
  }

  // 2. Check Meal Availability
  for (const item of cart.items) {
    if (!item.meal.isAvailable) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Meal '${item.meal.name}' is currently unavailable`
      );
    }
  }

  // 3. Calculate total amount
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.meal.price * item.quantity,
    0
  );

  const orderNumber = generateOrderNumber();

  // 4. Transaction: Create Order & Clear Cart
  const order = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: userId,
        totalAmount: Number(totalAmount.toFixed(2)),
        deliveryAddress: payload.deliveryAddress,
        contactPhone: payload.contactPhone,
        ...(payload.paymentMethod && { paymentMethod: payload.paymentMethod }),
        ...(payload.specialInstructions && {
          specialInstructions: payload.specialInstructions,
        }),
        items: {
          create: cart.items.map((item) => ({
            mealId: item.mealId,
            quantity: item.quantity,
            price: item.meal.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            meal: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });

  return {
    ...order,
    items: await Promise.all(order.items.map(withSignedOrderItemMealImages)),
  };
};

export const getMyOrders = async (
  userId: string,
  query: TGetOrdersQueryInput
) => {
  const { cursor, limit = 10, status } = query;

  const whereConditions: Prisma.OrderWhereInput = {
    customerId: userId,
    ...(status && { status }),
  };

  const orders = await prisma.order.findMany({
    where: whereConditions,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor } }),
    skip: cursor ? 1 : 0,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      items: {
        include: {
          meal: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (orders.length > limit) {
    orders.pop();
    nextCursor = orders.at(-1)?.id ?? null;
  }

  return {
    meta: { limit, nextCursor, hasMore: !!nextCursor },
    data: await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await Promise.all(
          order.items.map(withSignedOrderItemMealImages),
        ),
      })),
    ),
  };
};

export const getProviderOrders = async (
  userId: string,
  isAdmin: boolean,
  query: TGetOrdersQueryInput
) => {
  const { cursor, limit = 10, status } = query;

  let providerProfileId: string | undefined;

  if (!isAdmin) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile) {
      throw new ApiError(httpStatus.FORBIDDEN, "Provider profile not found");
    }
    providerProfileId = providerProfile.id;
  }

  // Order items relational check for provider meals
  const whereConditions: Prisma.OrderWhereInput = {
    ...(providerProfileId && {
      items: {
        some: {
          meal: {
            providerId: providerProfileId,
          },
        },
      },
    }),
    ...(status && { status }),
  };

  const orders = await prisma.order.findMany({
    where: whereConditions,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor } }),
    skip: cursor ? 1 : 0,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          meal: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (orders.length > limit) {
    orders.pop();
    nextCursor = orders.at(-1)?.id ?? null;
  }

  return {
    meta: { limit, nextCursor, hasMore: !!nextCursor },
    data: await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await Promise.all(
          order.items.map(withSignedOrderItemMealImages),
        ),
      })),
    ),
  };
};

export const getOrderById = async (
  orderId: string,
  userId: string,
  isAdmin: boolean
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  // Permission Verification
  if (!isAdmin && order.customerId !== userId) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    const isProviderMealOwner = order.items.some(
      (item) => item.meal.providerId === providerProfile?.id
    );

    if (!isProviderMealOwner) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to view this order"
      );
    }
  }

  return {
    ...order,
    items: await Promise.all(order.items.map(withSignedOrderItemMealImages)),
  };
};

export const updateOrderStatus = async (
  orderId: string,
  userId: string,
  isAdmin: boolean,
  payload: TUpdateOrderStatusInput
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (!isAdmin) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    const isProviderMealOwner = order.items.some(
      (item) => item.meal.providerId === providerProfile?.id
    );

    if (!isProviderMealOwner) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to update this order"
      );
    }
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: payload.status,
    },
    include: {
      items: true,
    },
  });
};

export const cancelOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.customerId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own orders"
    );
  }

  if (order.status !== OrderStatus.PLACED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel order once it is processed beyond PLACED state"
    );
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });
};