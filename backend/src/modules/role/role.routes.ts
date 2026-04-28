import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { roleController } from "./role.controller";

/**
 * Role API routes (authenticated only).
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  roleController.list(req, res).catch(next);
});

router.get("/permissions", requireAuth, (req, res, next) => {
  roleController.listPermissions(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  roleController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  roleController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  roleController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  roleController.remove(req, res).catch(next);
});

export const roleRoutes = router;
