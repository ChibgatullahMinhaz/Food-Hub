import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validateRequest";
import { Role } from "@/prisma/generated/prisma/enums";
import {
    createMealSchema,
    updateMealSchema,
    mealIdParamSchema,
    getMealQuerySchema,
} from "./meal.validation";
import {
    createMeal,
    getAllMeals,
    getMealById,
    updateMeal,
    deleteMeal,
} from "./meal.controller";

const mealRoutes: Router = Router();

// Public / Browsing Endpoints
mealRoutes.get(
    "/",
    validateRequest(getMealQuerySchema),
    getAllMeals
);

mealRoutes.get(
    "/:id",
    validateRequest(mealIdParamSchema),
    getMealById
);

// Protected Endpoints (Provider & Admin only)
mealRoutes.post(
    "/",
    requireAuth,
    requireRole(Role.PROVIDER, Role.ADMIN),
    validateRequest(createMealSchema),
    createMeal
);

mealRoutes.patch(
    "/:id",
    requireAuth,
    requireRole(Role.PROVIDER, Role.ADMIN),
    validateRequest(updateMealSchema),
    updateMeal
);

mealRoutes.delete(
    "/:id",
    requireAuth,
    requireRole(Role.PROVIDER, Role.ADMIN),
    validateRequest(mealIdParamSchema),
    deleteMeal
);

export default mealRoutes;