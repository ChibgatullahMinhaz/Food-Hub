import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validateRequest";
import { Role } from "@/prisma/generated/prisma/enums";
import {
    createOrderSchema,
    updateOrderStatusSchema,
    orderIdParamSchema,
    getOrdersQuerySchema,
} from "./order.validation";
import {
    createOrder,
    getMyOrders,
    getProviderOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} from "./order.controller";

const orderRoutes: Router = Router();

orderRoutes.use(requireAuth);

// Customer Endpoints
orderRoutes.post(
    "/",
    requireRole(Role.CUSTOMER),
    validateRequest(createOrderSchema),
    createOrder
);

orderRoutes.get(
    "/my-orders",
    requireRole(Role.CUSTOMER),
    validateRequest(getOrdersQuerySchema),
    getMyOrders
);

orderRoutes.patch(
    "/:id/cancel",
    requireRole(Role.CUSTOMER),
    validateRequest(orderIdParamSchema),
    cancelOrder
);

// Provider & Admin Endpoints
orderRoutes.get(
    "/provider-orders",
    requireRole(Role.PROVIDER, Role.ADMIN),
    validateRequest(getOrdersQuerySchema),
    getProviderOrders
);

orderRoutes.patch(
    "/:id/status",
    requireRole(Role.PROVIDER, Role.ADMIN),
    validateRequest(updateOrderStatusSchema),
    updateOrderStatus
);

// Shared Protected Endpoint
orderRoutes.get(
    "/:id",
    requireAuth,
    validateRequest(orderIdParamSchema),
    getOrderById
);

export default orderRoutes;