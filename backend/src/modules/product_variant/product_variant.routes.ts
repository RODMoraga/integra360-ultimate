import { Router } from "express";
import { productVariantController } from "./product_variant.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Product variant API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  productVariantController.list(req, res).catch(next);
});

router.get("/products", requireAuth, (req, res, next) => {
  productVariantController.listProducts(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  productVariantController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  productVariantController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  productVariantController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  productVariantController.remove(req, res).catch(next);
});

export const productVariantRoutes = router;
