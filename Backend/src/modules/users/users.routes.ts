import { Router } from "express";
import { validateRequest } from "@/middlewares/validateRequest";
import { getUsersQuerySchema } from "./user.validation";
import { getUsers } from "./users.controller";

const userRoutes: Router = Router();

userRoutes.get("/", validateRequest(getUsersQuerySchema), getUsers);


export default userRoutes; 
