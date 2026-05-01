import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { warehouseService } from "./warehouse.service";
import { createWarehouseSchema, updateWarehouseSchema } from "./warehouse.schema";

/**
 * HTTP controller for warehouse endpoints.
 */
class WarehouseController {
  /**
   * GET /warehouses
   * Returns active warehouses for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await warehouseService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /warehouses/:id
   * Returns one warehouse by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await warehouseService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /warehouses
   * Creates one warehouse after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createWarehouseSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await warehouseService.create(companyId, parsed.data);
    logger.info({ warehouseId: row.id }, "Warehouse created");
    res.status(201).json(row);
  }

  /**
   * PUT /warehouses/:id
   * Updates one warehouse after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateWarehouseSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await warehouseService.update(companyId, id, parsed.data);
    logger.info({ warehouseId: row.id }, "Warehouse updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /warehouses/:id
   * Soft-deletes one warehouse.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await warehouseService.remove(companyId, id);
    logger.info({ warehouseId: req.params.id }, "Warehouse soft-deleted");
    res.status(204).send();
  }
}

export const warehouseController = new WarehouseController();
