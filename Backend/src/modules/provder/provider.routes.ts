import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validateRequest";
import { applyProviderSchema, getProviderQuerySchema, providerIdParamSchema, updateProviderStatusSchema } from "./provider.validation";
import { applyForProvider, changeProviderStatus, getAllProviders, getProviderById } from "./provider.controller";
import { Role } from "@/prisma/generated/prisma/enums";

const providerRoutes: Router = Router();

providerRoutes.post(
    "/apply",
    requireAuth,
    requireRole(Role.ADMIN, Role.CUSTOMER),
    validateRequest(applyProviderSchema),
    applyForProvider
);

providerRoutes.patch(
    "/:id/status",
    requireAuth,
    requireRole(Role.ADMIN),
    validateRequest(updateProviderStatusSchema),
    changeProviderStatus
);

providerRoutes.get("/all/provider", requireAuth, requireRole(Role.ADMIN),
    validateRequest(getProviderQuerySchema), getAllProviders)
providerRoutes.get(
    "/:id",
    validateRequest(providerIdParamSchema),
    getProviderById
);
export default providerRoutes;