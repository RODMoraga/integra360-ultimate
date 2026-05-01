import { Router } from "express";
import { productController } from "./product.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Product API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  productController.list(req, res).catch(next);
});

router.get("/units", requireAuth, (req, res, next) => {
  productController.listUnits(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  productController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  productController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  productController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  productController.remove(req, res).catch(next);
});

export const productRoutes = router;