import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { getMonitorChecks, getMonitorCheckSeries } from "./checks.controller.js";
import validate from "../../middleware/validate.js";
import { rangeSchema } from "./checks.validation.js";

const router = Router();

router.get(
  "/monitors/:monitorId",
  authenticate,
  getMonitorChecks
);

router.get(
  "/series/monitors/:monitorId",
  authenticate,
  getMonitorCheckSeries
);

export default router;