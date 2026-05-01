import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { documentSequenceController } from "./document_sequence.controller";

/**
 * Document sequences API routes (authenticated only).
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  documentSequenceController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  documentSequenceController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  documentSequenceController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  documentSequenceController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  documentSequenceController.remove(req, res).catch(next);
});

export const documentSequenceRoutes = router;
