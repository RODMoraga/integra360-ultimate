import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { productImageService } from "./product_image.service";
import {
  createProductImageSchema,
  updateProductImageSchema
} from "./product_image.schema";

/**
 * HTTP controller for product_images endpoints.
 */
class ProductImageController {
  /**
   * GET /product-images
   * Returns active product images, optionally filtered by product_id.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const productId = req.query.product_id ? BigInt(String(req.query.product_id)) : undefined;
    const rows = await productImageService.list(companyId, productId);
    res.status(200).json(rows);
  }

  /**
   * GET /product-images/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await productImageService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /product-images
   * Validates multipart payload and creates a product image relation.
   */
  async create(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new AppError("Debe adjuntar una imagen (JPG o PNG)", 400);
    }

    const parsed = createProductImageSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const userId = req.user?.id ? BigInt(req.user.id) : null;

    const row = await productImageService.create(companyId, userId, parsed.data, req.file);
    logger.info({ productImageId: row.id }, "ProductImage created");
    res.status(201).json(row);
  }

  /**
   * PUT /product-images/:id
   * Updates metadata and optionally replaces the image file.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateProductImageSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);

    const row = await productImageService.update(companyId, id, parsed.data, req.file);
    logger.info({ productImageId: row.id }, "ProductImage updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /product-images/:id
   * Soft-deletes the product image relation.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await productImageService.remove(companyId, id);
    logger.info({ productImageId: req.params.id }, "ProductImage deleted");
    res.status(204).send();
  }
}

export const productImageController = new ProductImageController();
