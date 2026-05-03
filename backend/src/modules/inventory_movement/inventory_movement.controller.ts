import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { inventoryMovementService } from "./inventory_movement.service";
import {
  createInventoryMovementSchema,
  updateInventoryMovementSchema
} from "./inventory_movement.schema";

class InventoryMovementController {
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const movementTypeId = req.query.movement_type_id ? Number(req.query.movement_type_id) : undefined;
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const variantId = req.query.product_variant_id ? Number(req.query.product_variant_id) : undefined;
    const dateFrom = req.query.date_from ? new Date(String(req.query.date_from)) : undefined;
    const dateTo = req.query.date_to ? new Date(String(req.query.date_to)) : undefined;

    const rows = await inventoryMovementService.list(companyId, {
      movement_type_id: movementTypeId,
      warehouse_id: warehouseId,
      product_variant_id: variantId,
      date_from: dateFrom,
      date_to: dateTo
    });

    res.status(200).json(rows);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await inventoryMovementService.getById(companyId, id);
    res.status(200).json(row);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createInventoryMovementSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;

    const row = await inventoryMovementService.create(companyId, parsed.data, createdBy);
    logger.info({ inventoryMovementId: row.id }, "Inventory movement created");
    res.status(201).json(row);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateInventoryMovementSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await inventoryMovementService.update(companyId, id, parsed.data);
    logger.info({ inventoryMovementId: row.id }, "Inventory movement updated");
    res.status(200).json(row);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await inventoryMovementService.remove(companyId, id);
    logger.info({ inventoryMovementId: req.params.id }, "Inventory movement deleted");
    res.status(204).send();
  }
}

export const inventoryMovementController = new InventoryMovementController();
