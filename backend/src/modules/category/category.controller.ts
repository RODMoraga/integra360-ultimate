import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { categoryService } from "./category.service";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

/**
 * HTTP controller for category endpoints.
 */
class CategoryController {
  /**
   * GET /categories
   * Returns active categories for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await categoryService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /categories/:id
   * Returns one category by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await categoryService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /categories
   * Creates one category after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await categoryService.create(companyId, parsed.data);
    logger.info({ categoryId: row.id }, "Category created");
    res.status(201).json(row);
  }

  /**
   * PUT /categories/:id
   * Updates one category after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await categoryService.update(companyId, id, parsed.data);
    logger.info({ categoryId: row.id }, "Category updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /categories/:id
   * Soft-deletes one category.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await categoryService.remove(companyId, id);
    logger.info({ categoryId: req.params.id }, "Category soft-deleted");
    res.status(204).send();
  }
}

export const categoryController = new CategoryController();