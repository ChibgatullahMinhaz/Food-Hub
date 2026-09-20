import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { trustedOrigins } from "./constants/origin";
import { auth } from "./lib/auth";
import { globalErrorHandler } from "./errors/globalErrorHandler";
import notFound from "./middlewares/notFound";
import entryRoutes from "./routes";
const app: Application = express();
app.set("trust proxy", 1);

// Core Middlewares
app.use(
  cors({
    origin: trustedOrigins,
    credentials: true,
  }),
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Root Health-Check Route
app.use("/api", entryRoutes);

// Global Error Handler
app.use(globalErrorHandler);
// 404 Catch-All Handler
app.use(notFound);

export default app;
