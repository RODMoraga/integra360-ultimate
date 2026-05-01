import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { digitalAssetController } from "./digital_asset.controller";

/**
 * Digital assets API routes (authenticated only).
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  digitalAssetController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  digitalAssetController.getById(req, res).catch(next);
});

router.post("/", requireAuth, (req, res, next) => {
  digitalAssetController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, (req, res, next) => {
  digitalAssetController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  digitalAssetController.remove(req, res).catch(next);
});

export const digitalAssetRoutes = router;
