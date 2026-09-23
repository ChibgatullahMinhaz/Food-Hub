import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validateRequest";
import { Role } from "@/prisma/generated/prisma/enums";
import {
    createCategorySchema,
    updateCategorySchema,
    categoryIdParamSchema,
    getCategoryQuerySchema,
} from "./category.validation";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "./category.controller";

const categoryRoutes: Router = Router();

categoryRoutes.get("/",validateRequest(getCategoryQuerySchema), getAllCategories);
categoryRoutes.get("/:id", validateRequest(categoryIdParamSchema), getCategoryById);

categoryRoutes.post(
    "/",
    requireAuth,
    requireRole(Role.ADMIN, Role.PROVIDER),
    validateRequest(createCategorySchema),
    createCategory
);

categoryRoutes.patch(
    "/:id",
    requireAuth,
    requireRole(Role.ADMIN),
    validateRequest(updateCategorySchema),
    updateCategory
);

categoryRoutes.delete(
    "/:id",
    requireAuth,
    requireRole(Role.ADMIN),
    validateRequest(categoryIdParamSchema),
    deleteCategory
);

export default categoryRoutes;