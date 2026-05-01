import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { posTerminalController } from "./pos_terminal.controller";

/**
 * POS terminal API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  posTerminalController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  posTerminalController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  posTerminalController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  posTerminalController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  posTerminalController.remove(req, res).catch(next);
});

export const posTerminalRoutes = router;
