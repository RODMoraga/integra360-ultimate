import { RequestHandler, Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth/auth.middleware";
import { AppError } from "../../common/errors/app-error";
import { env } from "../../config/env";
import { productImageController } from "./product_image.controller";

const parseUploadSizeToBytes = (value: string): number => {
  const normalized = value.trim().toLowerCase();
  const matched = normalized.match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!matched) {
    return 5 * 1024 * 1024;
  }

  const amount = Number(matched[1]);
  const unit = matched[2] ?? "b";

  if (unit === "kb") return amount * 1024;
  if (unit === "mb") return amount * 1024 * 1024;
  if (unit === "gb") return amount * 1024 * 1024 * 1024;
  return amount;
};

const maxFileSize = parseUploadSizeToBytes(env.UPLOAD_MAX_SIZE);
const allowedMimeTypes = new Set(["image/jpeg", "image/png"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError("Formato inválido. Solo se permiten JPG y PNG", 400));
      return;
    }
    cb(null, true);
  }
});

const uploadSingleImage: RequestHandler = (req, res, next) => {
  upload.single("image")(req as never, res as never, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError(`La imagen supera el límite permitido (${env.UPLOAD_MAX_SIZE})`, 400));
      return;
    }

    next(error);
  });
};

/**
 * Product images CRUD routes.
 * All endpoints require JWT authentication.
 */
const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  productImageController.list(req, res).catch(next);
});

router.get("/:id", requireAuth, (req, res, next) => {
  productImageController.getById(req, res).catch(next);
});

router.post("/", requireAuth, uploadSingleImage, (req, res, next) => {
  productImageController.create(req, res).catch(next);
});

router.put("/:id", requireAuth, uploadSingleImage, (req, res, next) => {
  productImageController.update(req, res).catch(next);
});

router.delete("/:id", requireAuth, (req, res, next) => {
  productImageController.remove(req, res).catch(next);
});

export const productImageRoutes = router;
