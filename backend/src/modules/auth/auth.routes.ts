import { Router } from "express";
import validate from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from "./auth.validation.js";
import {
    registerController,
    loginController,
    logoutController,
    refreshTokenController,
    meController,
} from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/logout", authenticate, logoutController);
router.post("/refresh-token", validate(refreshTokenSchema), refreshTokenController);
router.get("/me", authenticate, meController);

export default router;
