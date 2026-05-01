import { Router } from "express";
import { supplierContactController } from "./supplier_contact.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Supplier contacts API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  supplierContactController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  supplierContactController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  supplierContactController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  supplierContactController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  supplierContactController.remove(req, res).catch(next);
});

export const supplierContactRoutes = router;
