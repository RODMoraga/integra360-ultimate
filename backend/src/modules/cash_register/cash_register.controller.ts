import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { cashRegisterService } from "./cash_register.service";
import { createCashRegisterSchema, updateCashRegisterSchema } from "./cash_register.schema";

class CashRegisterController {
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await cashRegisterService.list(companyId);
    res.status(200).json(rows);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await cashRegisterService.getById(companyId, id);
    res.status(200).json(row);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCashRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await cashRegisterService.create(companyId, parsed.data);
    logger.info({ cashRegisterId: row.id }, "Cash register created");
    res.status(201).json(row);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateCashRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await cashRegisterService.update(companyId, id, parsed.data);
    logger.info({ cashRegisterId: row.id }, "Cash register updated");
    res.status(200).json(row);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await cashRegisterService.remove(companyId, id);
    logger.info({ cashRegisterId: req.params.id }, "Cash register soft-deleted");
    res.status(204).send();
  }
}

export const cashRegisterController = new CashRegisterController();
