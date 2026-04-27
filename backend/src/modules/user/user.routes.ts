import { Router } from "express";
import { userController } from "./user.controller";
import { requireAuth } from "../auth/auth.middleware";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  userController.list(req, res).catch(next);
});

export const userRoutes = router;