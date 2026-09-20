import { Router } from "express";
import { validateRequest } from "@/middlewares/validateRequest";
import { getUsersQuerySchema } from "./user.validation";
import { getUsers } from "./users.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { Role } from "@/prisma/generated/prisma/enums";

const userRoutes: Router = Router();

// admin side api 
userRoutes.get("/", requireAuth, requireRole(Role.ADMIN), validateRequest(getUsersQuerySchema), getUsers);



export default userRoutes; 
