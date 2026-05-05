import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { reportController } from "./report.controller";

const router = Router();

router.get("/sales-daily", requireAuth, (req, res, next) => {
  reportController.dailySales(req, res).catch(next);
});

export const reportRoutes = router;
