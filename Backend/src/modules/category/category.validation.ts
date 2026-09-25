import { z } from "zod";

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2, "Category name must be at least 2 characters"),
        image: z.string().url("Invalid image URL").optional(),
    }),
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().cuid("Invalid Category ID"),
    }),
    body: z.object({
        name: z.string().min(2, "Category name must be at least 2 characters").optional(),
        image: z.string().url("Invalid image URL").optional(),
    }),
});

export const categoryIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid("Invalid Category ID"),
    }),
});

export const getCategoryQuerySchema = z.object({
    query: z.object({
        cursor: z.string().optional(),
        limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10)),
        search: z.string().optional(),
        sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    }),
});


// Zod Inferred Types Export
export type TGetCategoryQueryInput = z.infer<typeof getCategoryQuerySchema>["query"];
export type TCreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type TUpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type TCategoryIdParamInput = z.infer<typeof categoryIdParamSchema>["params"];