import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { brandService } from "./brand.service";
import { createBrandSchema, updateBrandSchema } from "./brand.schema";

/**
 * HTTP controller for brand endpoints.
 */
class BrandController {
  /**
   * GET /brands
   * Returns active brands for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await brandService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /brands/:id
   * Returns one brand by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await brandService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /brands
   * Creates one brand after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createBrandSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await brandService.create(companyId, parsed.data);
    logger.info({ brandId: row.id }, "Brand created");
    res.status(201).json(row);
  }

  /**
   * PUT /brands/:id
   * Updates one brand after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateBrandSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await brandService.update(companyId, id, parsed.data);
    logger.info({ brandId: row.id }, "Brand updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /brands/:id
   * Soft-deletes one brand.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await brandService.remove(companyId, id);
    logger.info({ brandId: id.toString() }, "Brand deleted");
    res.status(204).send();
  }
}

export const brandController = new BrandController();
