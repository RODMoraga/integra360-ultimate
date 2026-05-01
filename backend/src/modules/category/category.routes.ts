import { Router } from "express";
import { categoryController } from "./category.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Category API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  categoryController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  categoryController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  categoryController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  categoryController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  categoryController.remove(req, res).catch(next);
});

export const categoryRoutes = router;