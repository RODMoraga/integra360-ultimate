import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { warehouseController } from "./warehouse.controller";

/**
 * Warehouse API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  warehouseController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  warehouseController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  warehouseController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  warehouseController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  warehouseController.remove(req, res).catch(next);
});

export const warehouseRoutes = router;
