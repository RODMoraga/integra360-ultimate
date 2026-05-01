import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { documentTypeController } from "./document_type.controller";

/**
 * Document type API routes (authenticated only).
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  documentTypeController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  documentTypeController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  documentTypeController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  documentTypeController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  documentTypeController.remove(req, res).catch(next);
});

export const documentTypeRoutes = router;
