import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { supplierService } from "./supplier.service";
import { createSupplierSchema, updateSupplierSchema } from "./supplier.schema";

/**
 * HTTP controller for supplier endpoints.
 */
class SupplierController {
  /**
   * GET /suppliers
   * Returns active suppliers for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await supplierService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /suppliers/:id
   * Returns one supplier by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await supplierService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /suppliers
   * Creates one supplier after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;
    const row = await supplierService.create(companyId, { ...parsed.data, created_by: createdBy });
    logger.info({ supplierId: row.id }, "Supplier created");
    res.status(201).json(row);
  }

  /**
   * PUT /suppliers/:id
   * Updates one supplier after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await supplierService.update(companyId, id, parsed.data);
    logger.info({ supplierId: row.id }, "Supplier updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /suppliers/:id
   * Soft-deletes one supplier.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await supplierService.remove(companyId, id);
    logger.info({ supplierId: req.params.id }, "Supplier soft-deleted");
    res.status(204).send();
  }
}

export const supplierController = new SupplierController();

