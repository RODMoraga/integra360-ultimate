import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { supplierController } from "./supplier.controller";

/**
 * Supplier API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  supplierController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  supplierController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  supplierController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  supplierController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  supplierController.remove(req, res).catch(next);
});

export const supplierRoutes = router;

