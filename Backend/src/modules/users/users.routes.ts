import { Router } from "express";
import { validateRequest } from "@/middlewares/validateRequest";
import { getUsersQuerySchema, updateUserSchema, userDeleteSchema, userDetailsSchema } from "./user.validation";
import { currentUserProfile, deleteUser, getUsers, updateUser, userDetails } from "./users.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { Role } from "@/prisma/generated/prisma/enums";

const userRoutes: Router = Router();

// admin side api 
userRoutes.get("/", requireAuth, requireRole(Role.ADMIN), validateRequest(getUsersQuerySchema), getUsers);
userRoutes.patch("/:id", requireAuth, requireRole(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), validateRequest(updateUserSchema), updateUser);
userRoutes.delete("/:id", requireAuth, requireRole(Role.ADMIN), validateRequest(userDeleteSchema), deleteUser);

//  Get Single User (Single Details API)
userRoutes.get("/:id/details", requireAuth, requireRole(Role.ADMIN), validateRequest(userDetailsSchema) ,userDetails)

// Get My Profile / Current User Profile
userRoutes.get("/current/profile", requireAuth, currentUserProfile)

export default userRoutes; 
