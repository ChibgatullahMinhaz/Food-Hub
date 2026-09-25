import cartRoutes from "@/modules/cart/cart.routes";
import categoryRoutes from "@/modules/category/category.routes";
import mealRoutes from "@/modules/meal/meal.routes";
import orderRoutes from "@/modules/order/order.routes";
import providerRoutes from "@/modules/provder/provider.routes";
import reviewRoutes from "@/modules/review/review.routes";
import userRoutes from "@/modules/users/users.routes";
import { Router } from "express";

const entryRoutes: Router = Router();

entryRoutes.use('/admin/users', userRoutes)
entryRoutes.use('/cart', cartRoutes)
entryRoutes.use('/prodivers', providerRoutes)
entryRoutes.use('/meals', mealRoutes)
entryRoutes.use('/review', reviewRoutes)
entryRoutes.use('/order', orderRoutes)
entryRoutes.use('/category', categoryRoutes)

export default entryRoutes;