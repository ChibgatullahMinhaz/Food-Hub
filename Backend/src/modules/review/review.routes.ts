import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validateRequest";
import { Role } from "@/prisma/generated/prisma/enums";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
  getReviewsQuerySchema,
} from "./review.validation";
import {
  createReview,
  getMealReviews,
  getProviderReviews,
  updateReview,
  deleteReview,
} from "./review.controller";

const reviewRoutes:Router = Router();

// Public Endpoints (Anyone can view reviews)
reviewRoutes.get(
  "/meal/:mealId",
  validateRequest(getReviewsQuerySchema),
  getMealReviews
);

reviewRoutes.get(
  "/provider/:providerId",
  validateRequest(getReviewsQuerySchema),
  getProviderReviews
);

// Protected Endpoints
reviewRoutes.use(requireAuth);

reviewRoutes.post(
  "/",
  requireRole(Role.CUSTOMER),
  validateRequest(createReviewSchema),
  createReview
);

reviewRoutes.patch(
  "/:id",
  requireRole(Role.CUSTOMER),
  validateRequest(updateReviewSchema),
  updateReview
);

reviewRoutes.delete(
  "/:id",
  validateRequest(reviewIdParamSchema),
  deleteReview
);

export default reviewRoutes;