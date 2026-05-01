import { Router } from "express";
import { regionController } from "./region.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Region API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  regionController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  regionController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  regionController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  regionController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  regionController.remove(req, res).catch(next);
});

export const regionRoutes = router;
