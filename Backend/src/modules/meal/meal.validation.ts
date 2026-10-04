import { booleanString, numericString } from "@/utils/zodCoerce";
import { z } from "zod";

export const createMealSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Meal name must be at least 2 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    price: numericString.positive("Price must be a positive number"),
    preparationTime: numericString.int("Preparation time must be an integer").optional(),
    isAvailable: booleanString.default(true),
    isVegetarian: booleanString.default(false),
    dietaryType: z.string().optional(),
    categoryId: z.string().cuid("Invalid Category ID"),
    providerId: z.string().cuid("Invalid Provider ID").optional(),
  }),
  files: z
    .array(
      z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z
          .string()
          .refine(
            (type) => type.startsWith("image/"),
            "Only image files are allowed",
          ),
        buffer: z.instanceof(Buffer),
        size: z.number(),
      }),
    )
    .min(1, "At least one image is required")
    .optional(),
});

export const updateMealSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid Meal ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Meal name must be at least 2 characters")
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    isAvailable: z.boolean().optional(),
    isVegetarian: z.boolean().optional(),
    dietaryType: z.string().optional(),
    categoryId: z.string().cuid("Invalid Category ID").optional(),
    providerId: z.string().cuid("Invalid Provider ID").optional(),
  }),
  files: z
    .array(
      z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z
          .string()
          .refine(
            (type) => type.startsWith("image/"),
            "Only image files are allowed",
          ),
        buffer: z.instanceof(Buffer),
        size: z.number(),
      }),
    )
    .min(1, "At least one image is required")
    .optional(),
});

export const mealIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid Meal ID"),
  }),
});

export const getMealQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    search: z.string().optional(),
    categoryId: z.string().cuid("Invalid Category ID").optional(),
    providerId: z.string().cuid("Invalid Provider ID").optional(),
    isAvailable: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => (val ? val === "true" : undefined)),
    isVegetarian: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => (val ? val === "true" : undefined)),
    dietaryType: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    sortBy: z
      .enum(["price", "createdAt", "name"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// Inferred Types Export
export type TCreateMealInput = z.infer<typeof createMealSchema>["body"];
export type TUpdateMealInput = z.infer<typeof updateMealSchema>["body"];
export type TMealIdParamInput = z.infer<typeof mealIdParamSchema>["params"];
export type TGetMealQueryInput = z.infer<typeof getMealQuerySchema>["query"];
