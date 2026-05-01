import { Router } from "express";
import { modelController } from "./model.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Model API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  modelController.list(req, res).catch(next);
});

router.get("/brands", requireAuth, (req, res, next) => {
  modelController.listBrands(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  modelController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  modelController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  modelController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  modelController.remove(req, res).catch(next);
});

export const modelRoutes = router;