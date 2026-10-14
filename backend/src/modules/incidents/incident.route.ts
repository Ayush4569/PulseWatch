
import { Router } from "express";
import {
  getIncidents,
  getIncidentById,
} from "./incident.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getIncidents);
router.get("/:incidentId", authenticate, getIncidentById);

export default router;
