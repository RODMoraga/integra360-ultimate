import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import {
  createInventoryMovementTypeSchema,
  updateInventoryMovementTypeSchema
} from "./inventory_movement_type.schema";
import { inventoryMovementTypeService } from "./inventory_movement_type.service";

class InventoryMovementTypeController {
  async list(_req: Request, res: Response): Promise<void> {
    const rows = await inventoryMovementTypeService.list();
    res.status(200).json(rows);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const row = await inventoryMovementTypeService.getById(BigInt(req.params.id));
    res.status(200).json(row);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createInventoryMovementTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const created = await inventoryMovementTypeService.create(parsed.data);
    logger.info({ inventoryMovementTypeId: created.id }, "Inventory movement type created");
    res.status(201).json(created);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateInventoryMovementTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const updated = await inventoryMovementTypeService.update(BigInt(req.params.id), parsed.data);
    logger.info({ inventoryMovementTypeId: updated.id }, "Inventory movement type updated");
    res.status(200).json(updated);
  }

  async remove(req: Request, res: Response): Promise<void> {
    await inventoryMovementTypeService.remove(BigInt(req.params.id));
    logger.info({ inventoryMovementTypeId: req.params.id }, "Inventory movement type deleted");
    res.status(204).send();
  }
}

export const inventoryMovementTypeController = new InventoryMovementTypeController();