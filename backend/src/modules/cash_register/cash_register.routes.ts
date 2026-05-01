import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { cashRegisterController } from "./cash_register.controller";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  cashRegisterController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  cashRegisterController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  cashRegisterController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  cashRegisterController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  cashRegisterController.remove(req, res).catch(next);
});

export const cashRegisterRoutes = router;
