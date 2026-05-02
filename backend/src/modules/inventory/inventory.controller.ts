import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { inventoryService } from "./inventory.service";
import { createInventorySchema, updateInventorySchema } from "./inventory.schema";

class InventoryController {
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const lowStock = req.query.low_stock === "true";

    const rows = await inventoryService.list(companyId, {
      warehouse_id: warehouseId,
      low_stock: lowStock
    });
    res.status(200).json(rows);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await inventoryService.getById(companyId, id);
    res.status(200).json(row);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createInventorySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await inventoryService.create(companyId, parsed.data);
    logger.info({ inventoryId: row.id }, "Inventory record created");
    res.status(201).json(row);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateInventorySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await inventoryService.update(companyId, id, parsed.data);
    logger.info({ inventoryId: row.id }, "Inventory record updated");
    res.status(200).json(row);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await inventoryService.remove(companyId, id);
    logger.info({ inventoryId: req.params.id }, "Inventory record deleted");
    res.status(204).send();
  }
}

export const inventoryController = new InventoryController();
