import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../common/middleware/validate-request";
import { loginSchema, registerSchema } from "./auth.schema";

/**
 * Authentication routes.
 */
const router = Router();

router.post("/register", validateRequest(registerSchema), (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post("/login", validateRequest(loginSchema), (req, res, next) => {
  authController.login(req, res).catch(next);
});

export const authRoutes = router;