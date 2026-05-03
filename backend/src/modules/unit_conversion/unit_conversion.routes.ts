import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { unitConversionController } from "./unit_conversion.controller";

/**
 * Unit conversion API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  unitConversionController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  unitConversionController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  unitConversionController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  unitConversionController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  unitConversionController.remove(req, res).catch(next);
});

export const unitConversionRoutes = router;
