import { Router } from "express";
import {
    getSingleMonitorAnalytics,
    getDashboardAiSummary,
} from "./analytics.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/dashboard-summary", authenticate, getDashboardAiSummary);
router.get("/monitors/:monitorId/overview", authenticate, getSingleMonitorAnalytics);

export default router;
