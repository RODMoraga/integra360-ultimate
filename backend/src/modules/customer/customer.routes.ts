import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { customerController } from "./customer.controller";

/**
 * Customer API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  customerController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  customerController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  customerController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  customerController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  customerController.remove(req, res).catch(next);
});

export const customerRoutes = router;
