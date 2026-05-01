import { Router } from "express";
import { cityController } from "./city.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * City API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  cityController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  cityController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  cityController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  cityController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  cityController.remove(req, res).catch(next);
});

export const cityRoutes = router;
