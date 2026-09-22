import { Router } from "express";
import { validateRequest } from "@/middlewares/validateRequest";
import { getUsersQuerySchema, updateUserSchema, userDeleteSchema } from "./user.validation";
import { deleteUser, getUsers, updateUser } from "./users.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { Role } from "@/prisma/generated/prisma/enums";

const userRoutes: Router = Router();

// admin side api 
userRoutes.get("/", requireAuth, requireRole(Role.ADMIN), validateRequest(getUsersQuerySchema), getUsers);
userRoutes.patch("/:id", requireAuth, requireRole(Role.ADMIN), validateRequest(updateUserSchema), updateUser);
userRoutes.delete("/:id", requireAuth, requireRole(Role.ADMIN), validateRequest(userDeleteSchema), deleteUser);



export default userRoutes; 
