import { Router } from "express";
import { getAllAnalytics,getSingleMonitorAnalytics } from "./analytics.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";


const router = Router();
router.get("/monitors",authenticate,getAllAnalytics);

router.get("/monitors/:monitorId",authenticate,getSingleMonitorAnalytics);

export default router;