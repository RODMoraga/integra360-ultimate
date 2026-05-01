import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { documentController } from "./document.controller";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  documentController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  documentController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  documentController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  documentController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  documentController.remove(req, res).catch(next);
});

export const documentRoutes = router;
