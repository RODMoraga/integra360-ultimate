import { Router } from "express";
import { customerContactController } from "./customer_contact.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Customer contacts API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  customerContactController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  customerContactController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  customerContactController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  customerContactController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  customerContactController.remove(req, res).catch(next);
});

export const customerContactRoutes = router;
