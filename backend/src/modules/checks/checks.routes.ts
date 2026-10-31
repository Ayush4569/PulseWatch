import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { getMonitorChecks, getMonitorCheckSeries } from "./checks.controller.js";

const router = Router();

router.get(
  "/monitors/:monitorId",
  authenticate,
  getMonitorChecks
);

router.get(
  "/monitors/:monitorId/series",
  authenticate,
  getMonitorCheckSeries
);

export default router;