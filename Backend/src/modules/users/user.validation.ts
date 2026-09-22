import { Role, UserStatus } from "@/prisma/generated/prisma/enums";
import { z } from "zod";

export const getUsersQuerySchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(
        z
          .number()
          .positive("Limit must be positive")
          .max(100, "Limit cannot exceed 100")
      ),
    cursor: z.string().optional(),
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});


export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID is required and must be a valid UUID"),
  }),

  body: z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }).strict(),
});


export const userDeleteSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID is required and must be a valid UUID"),
  })
});

export const userUpdateQuerySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }).strict()
})

//Types 
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>["query"];
export type UpdateUsersBodyInput = z.infer<typeof updateUserSchema>["body"];
export type UpdateUsersParamsInput = z.infer<typeof updateUserSchema>["params"];
export type DeleteUsersParamsInput = z.infer<typeof userDeleteSchema>["params"];
