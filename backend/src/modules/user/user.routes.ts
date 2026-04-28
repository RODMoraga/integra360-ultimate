import { Router } from "express";
import { userController } from "./user.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * User routes (authenticated only).
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  userController.list(req, res).catch(next);
});

router.get("/roles", requireAuth, (req, res, next) => {
  userController.listRoles(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  userController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  userController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  userController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  userController.remove(req, res).catch(next);
});

export const userRoutes = router;