import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    mealId: z.string().cuid("Invalid Meal ID"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0")
      .default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().cuid("Invalid Cart Item ID"),
  }),
  body: z.object({
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0"),
  }),
});

export const cartItemIdParamSchema = z.object({
  params: z.object({
    itemId: z.string().cuid("Invalid Cart Item ID"),
  }),
});

export type TAddToCartInput = z.infer<typeof addToCartSchema>["body"];
export type TUpdateCartItemInput = z.infer<typeof updateCartItemSchema>["body"];