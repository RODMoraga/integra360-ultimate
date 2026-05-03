import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { inventoryMovementController } from "./inventory_movement.controller";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  inventoryMovementController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  inventoryMovementController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  inventoryMovementController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  inventoryMovementController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  inventoryMovementController.remove(req, res).catch(next);
});

export const inventoryMovementRoutes = router;
