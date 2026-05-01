import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { subcategoryService } from "./subcategory.service";
import { createSubcategorySchema, updateSubcategorySchema } from "./subcategory.schema";

/**
 * HTTP controller for subcategory endpoints.
 */
class SubcategoryController {
  /**
   * GET /subcategories
   * Returns active subcategories for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await subcategoryService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /subcategories/:id
   * Returns one subcategory by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await subcategoryService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /subcategories
   * Creates one subcategory after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createSubcategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await subcategoryService.create(companyId, parsed.data);
    logger.info({ subcategoryId: row.id }, "Subcategory created");
    res.status(201).json(row);
  }

  /**
   * PUT /subcategories/:id
   * Updates one subcategory after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateSubcategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await subcategoryService.update(companyId, id, parsed.data);
    logger.info({ subcategoryId: row.id }, "Subcategory updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /subcategories/:id
   * Soft-deletes one subcategory.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await subcategoryService.remove(companyId, id);
    logger.info({ subcategoryId: req.params.id }, "Subcategory soft-deleted");
    res.status(204).send();
  }
}

export const subcategoryController = new SubcategoryController();