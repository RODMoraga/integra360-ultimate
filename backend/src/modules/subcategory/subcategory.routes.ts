import { Router } from "express";
import { subcategoryController } from "./subcategory.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Subcategory API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  subcategoryController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  subcategoryController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  subcategoryController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  subcategoryController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  subcategoryController.remove(req, res).catch(next);
});

export const subcategoryRoutes = router;