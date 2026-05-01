import { Router } from "express";
import { unitOfMeasureController } from "./unit_of_measure.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Units of Measure CRUD routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  unitOfMeasureController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  unitOfMeasureController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  unitOfMeasureController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  unitOfMeasureController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  unitOfMeasureController.remove(req, res).catch(next);
});

export const unitOfMeasureRoutes = router;
