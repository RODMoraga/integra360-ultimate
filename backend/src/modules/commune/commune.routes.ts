import { Router } from "express";
import { communeController } from "./commune.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Commune API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  communeController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  communeController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  communeController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  communeController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  communeController.remove(req, res).catch(next);
});

export const communeRoutes = router;
