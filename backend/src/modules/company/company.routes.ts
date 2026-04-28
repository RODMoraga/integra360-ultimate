import { Router } from "express";
import { companyController } from "./company.controller";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Company API routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  companyController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  companyController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  companyController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  companyController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  companyController.remove(req, res).catch(next);
});

export const companyRoutes = router;
