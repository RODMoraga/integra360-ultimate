import { Router } from "express";
import { brandController } from "./brand.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Brand API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  brandController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  brandController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  brandController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  brandController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  brandController.remove(req, res).catch(next);
});

export const brandRoutes = router;
