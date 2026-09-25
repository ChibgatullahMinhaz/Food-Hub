import { ProviderStatus } from "@/prisma/generated/prisma/enums";
import { z } from "zod";

export const applyProviderSchema = z.object({
  body: z.object({
    restaurantName: z.string().min(3, "Restaurant name must be at least 3 characters"),
    description: z.string().optional(),
    bannerImage: z.string().url("Invalid image URL").optional(),
    cuisineType: z.string().optional(),
    address: z.string().min(5, "Address is required"),
    phone: z.string().min(10, "Valid phone number is required"),
  }),
});

export const updateProviderStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid Provider Profile ID"),
  }),
  body: z.object({
    status: z.nativeEnum(ProviderStatus, {
      message: "Status must be APPROVED or REJECTED",
    }),
  }),
});


export const getProviderQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    status: z.nativeEnum(ProviderStatus).optional(), 
    search: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});


export const providerIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid("Invalid Provider ID"),
  }),
});

export type TProviderIdParamInput = z.infer<typeof providerIdParamSchema>["params"];
// Types Export
export type GetProviderQueryInput = z.infer<typeof getProviderQuerySchema>["query"];