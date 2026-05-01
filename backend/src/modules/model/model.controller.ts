import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { modelService } from "./model.service";
import { createModelSchema, updateModelSchema } from "./model.schema";

/**
 * HTTP controller for model endpoints.
 */
class ModelController {
  /**
   * GET /models
   * Returns active models for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await modelService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /models/brands
   * Returns active brands for current company.
   */
  async listBrands(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await modelService.listBrands(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /models/:id
   * Returns one model by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await modelService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /models
   * Creates one model after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createModelSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await modelService.create(companyId, parsed.data);
    logger.info({ modelId: row.id }, "Model created");
    res.status(201).json(row);
  }

  /**
   * PUT /models/:id
   * Updates one model after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateModelSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await modelService.update(companyId, id, parsed.data);
    logger.info({ modelId: row.id }, "Model updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /models/:id
   * Soft-deletes one model.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await modelService.remove(companyId, id);
    logger.info({ modelId: req.params.id }, "Model soft-deleted");
    res.status(204).send();
  }
}

export const modelController = new ModelController();