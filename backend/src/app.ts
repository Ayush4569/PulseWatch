import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import monitorRoutes from "./modules/monitor/monitor.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import analyticRoutes from "./modules/analytics/analytics.routes.js";
import { errorHandler } from "./utils/apiError.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || true,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        message: "Uptime Monitor API is running",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/monitors", monitorRoutes);
app.use("/api/v1/analytics", analyticRoutes);
app.use(errorHandler);
export default app;