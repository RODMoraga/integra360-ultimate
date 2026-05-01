import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { unitOfMeasureService } from "./unit_of_measure.service";
import {
  createUnitOfMeasureSchema,
  updateUnitOfMeasureSchema
} from "./unit_of_measure.schema";

/**
 * HTTP controller for units_of_measure endpoints.
 */
class UnitOfMeasureController {
  /**
   * GET /units-of-measure
   * Returns active units for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await unitOfMeasureService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /units-of-measure/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await unitOfMeasureService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /units-of-measure
   * Validates payload and creates a unit of measure record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createUnitOfMeasureSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await unitOfMeasureService.create(companyId, parsed.data);
    logger.info({ unitId: row.id }, "UnitOfMeasure created");
    res.status(201).json(row);
  }

  /**
   * PUT /units-of-measure/:id
   * Validates payload and updates the unit of measure.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateUnitOfMeasureSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await unitOfMeasureService.update(companyId, id, parsed.data);
    logger.info({ unitId: row.id }, "UnitOfMeasure updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /units-of-measure/:id
   * Soft-deletes the unit. Blocks if products reference it.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await unitOfMeasureService.remove(companyId, id);
    logger.info({ unitId: req.params.id }, "UnitOfMeasure soft-deleted");
    res.status(204).send();
  }
}

export const unitOfMeasureController = new UnitOfMeasureController();
