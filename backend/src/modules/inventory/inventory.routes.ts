import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { inventoryController } from "./inventory.controller";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  inventoryController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  inventoryController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  inventoryController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  inventoryController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  inventoryController.remove(req, res).catch(next);
});

export const inventoryRoutes = router;
