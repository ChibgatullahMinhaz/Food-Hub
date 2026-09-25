import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    mealId: z.string({ message: "Meal ID is required" }).cuid({ message: "Invalid Meal ID" }),
    orderId: z.string({ message: "Order ID must be a string" }).cuid({ message: "Invalid Order ID" }).optional(),
    rating: z
      .number({ message: "Rating is required" })
      .int({ message: "Rating must be an integer" })
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating cannot exceed 5" }),
    comment: z
      .string({ message: "Comment is required" })
      .min(3, { message: "Comment must be at least 3 characters long" }),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Review ID" }),
  }),
  body: z.object({
    rating: z
      .number({ message: "Rating must be a number" })
      .int({ message: "Rating must be an integer" })
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating cannot exceed 5" })
      .optional(),
    comment: z
      .string({ message: "Comment must be a string" })
      .min(3, { message: "Comment must be at least 3 characters" })
      .optional(),
  }),
});

export const reviewIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid Review ID" }),
  }),
});

export const getReviewsQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce
      .number({ message: "Limit must be a number" })
      .int({ message: "Limit must be an integer" })
      .positive({ message: "Limit must be a positive number" })
      .default(10),
  }),
});

export type TCreateReviewInput = z.infer<typeof createReviewSchema>["body"];
export type TUpdateReviewInput = z.infer<typeof updateReviewSchema>["body"];
export type TGetReviewsQueryInput = z.infer<typeof getReviewsQuerySchema>["query"];