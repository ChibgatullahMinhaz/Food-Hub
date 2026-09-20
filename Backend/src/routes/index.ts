import userRoutes from "@/modules/users/users.routes";
import { Router } from "express";

const entryRoutes: Router = Router();

entryRoutes.use('/admin/users', userRoutes)

export default entryRoutes;