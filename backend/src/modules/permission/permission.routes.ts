import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { permissionController } from "./permission.controller";

/**
 * Permission API routes (authenticated only).
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  permissionController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  permissionController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  permissionController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  permissionController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  permissionController.remove(req, res).catch(next);
});

export const permissionRoutes = router;
