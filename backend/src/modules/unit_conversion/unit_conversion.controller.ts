import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { unitConversionService } from "./unit_conversion.service";
import {
  createUnitConversionSchema,
  updateUnitConversionSchema
} from "./unit_conversion.schema";

/**
 * HTTP controller for unit_conversions endpoints.
 */
class UnitConversionController {
  /**
   * GET /unit-conversions
   * Returns conversion rows for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await unitConversionService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /unit-conversions/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await unitConversionService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /unit-conversions
   * Validates payload and creates one conversion row.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createUnitConversionSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await unitConversionService.create(companyId, parsed.data);
    logger.info({ conversionId: row.id }, "UnitConversion created");
    res.status(201).json(row);
  }

  /**
   * PUT /unit-conversions/:id
   * Validates payload and updates one conversion row.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateUnitConversionSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await unitConversionService.update(companyId, id, parsed.data);
    logger.info({ conversionId: row.id }, "UnitConversion updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /unit-conversions/:id
   * Removes one conversion row.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await unitConversionService.remove(companyId, id);
    logger.info({ conversionId: req.params.id }, "UnitConversion deleted");
    res.status(204).send();
  }
}

export const unitConversionController = new UnitConversionController();
