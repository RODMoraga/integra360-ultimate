import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { productVariantService } from "./product_variant.service";
import { createProductVariantSchema, updateProductVariantSchema } from "./product_variant.schema";

/**
 * HTTP controller for product variant endpoints.
 */
class ProductVariantController {
  /**
   * GET /product-variants
   * Returns active product variants for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await productVariantService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /product-variants/products
   * Returns active products for current company (used in variant forms).
   */
  async listProducts(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await productVariantService.listProducts(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /product-variants/:id
   * Returns one product variant by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await productVariantService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /product-variants
   * Creates one product variant after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createProductVariantSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await productVariantService.create(companyId, parsed.data);
    logger.info({ productVariantId: row.id, variantCode: row.variant_code }, "ProductVariant created");
    res.status(201).json(row);
  }

  /**
   * PUT /product-variants/:id
   * Updates one product variant after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateProductVariantSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await productVariantService.update(companyId, id, parsed.data);
    logger.info({ productVariantId: row.id }, "ProductVariant updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /product-variants/:id
   * Soft-deletes one product variant.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await productVariantService.remove(companyId, id);
    logger.info({ productVariantId: id.toString() }, "ProductVariant deleted");
    res.status(204).send();
  }
}

export const productVariantController = new ProductVariantController();
