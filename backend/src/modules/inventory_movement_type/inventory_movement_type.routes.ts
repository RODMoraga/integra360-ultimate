import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { inventoryMovementTypeController } from "./inventory_movement_type.controller";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  inventoryMovementTypeController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  inventoryMovementTypeController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  inventoryMovementTypeController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  inventoryMovementTypeController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  inventoryMovementTypeController.remove(req, res).catch(next);
});

export const inventoryMovementTypeRoutes = router;