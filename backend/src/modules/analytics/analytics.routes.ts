import { Router } from "express";
import { getSingleMonitorAnalytics } from "./analytics.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";


const router = Router();

router.get("/monitors/:monitorId/overview",authenticate,getSingleMonitorAnalytics);

export default router;