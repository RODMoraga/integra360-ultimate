import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { productService } from "./product.service";
import { createProductSchema, updateProductSchema } from "./product.schema";

/**
 * HTTP controller for product endpoints.
 */
class ProductController {
  /**
   * GET /products
   * Returns active products for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await productService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /products/units
   * Returns active units of measure for current company (used in product forms).
   */
  async listUnits(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await productService.listUnits(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /products/:id
   * Returns one product by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await productService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /products
   * Creates one product after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await productService.create(companyId, parsed.data);
    logger.info({ productId: row.id, sku: row.sku }, "Product created");
    res.status(201).json(row);
  }

  /**
   * PUT /products/:id
   * Updates one product after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await productService.update(companyId, id, parsed.data);
    logger.info({ productId: row.id }, "Product updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /products/:id
   * Soft-deletes one product.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await productService.remove(companyId, id);
    logger.info({ productId: id.toString() }, "Product deleted");
    res.status(204).send();
  }
}

export const productController = new ProductController();
