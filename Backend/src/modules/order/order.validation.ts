import { z } from "zod";
import { OrderStatus } from "@/prisma/generated/prisma/enums";

export const createOrderSchema = z.object({
  body: z.object({
    deliveryAddress: z
      .string({ message: "Delivery address is required" })
      .min(5, { message: "Delivery address must be at least 5 characters" }),

    contactPhone: z
      .string({ message: "Contact phone is required" })
      .min(10, { message: "Invalid contact phone number" }),

    paymentMethod: z.string().optional(),
    specialInstructions: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Order ID" }),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      message: "Valid order status is required",
    }),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Order ID" }),
  }),
});

export const getOrdersQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce
      .number({ message: "Limit must be a number" })
      .int({ message: "Limit must be an integer" })
      .positive({ message: "Limit must be a positive number" })
      .default(10),
    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export type TCreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type TUpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>["body"];
export type TGetOrdersQueryInput = z.infer<typeof getOrdersQuerySchema>["query"];