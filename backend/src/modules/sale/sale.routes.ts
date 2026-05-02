import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { saleController } from "./sale.controller";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  saleController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  saleController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  saleController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  saleController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  saleController.remove(req, res).catch(next);
});

export const saleRoutes = router;
