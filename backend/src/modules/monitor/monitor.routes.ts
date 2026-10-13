import { Router } from "express";
import { createMonitor, getMonitorById, getMonitors, updateMontiorConfig,deleteMonitor, toggleStatus } from "./monitor.controller.js";
import validate from "../../middleware/validate.js";
import {createMonitorSchema, updateMonitorSchema} from "./monitor.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getMonitors);
router.post("/create", authenticate, validate(createMonitorSchema), createMonitor);
router.get("/:monitorId",authenticate,getMonitorById)
router.patch("/:monitorId",authenticate,validate(updateMonitorSchema),updateMontiorConfig)
router.patch("/:monitorId/status",authenticate,toggleStatus)
router.delete("/:monitorId",authenticate,deleteMonitor)

export default router;