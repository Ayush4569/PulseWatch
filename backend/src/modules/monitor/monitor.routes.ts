import { Router } from "express";
import { createMonitor, getMonitors } from "./monitor.controller.js";
import validate from "../../middleware/validate.js";
import monitorSchema from "./monitor.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, getMonitors);
router.post("/create", authenticate, validate(monitorSchema), createMonitor);

export default router;