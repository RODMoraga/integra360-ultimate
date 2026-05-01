import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { supplierContactService } from "./supplier_contact.service";
import {
  createSupplierContactSchema,
  updateSupplierContactSchema
} from "./supplier_contact.schema";

/**
 * HTTP controller for supplier_contacts endpoints.
 */
class SupplierContactController {
  /**
   * GET /supplier-contacts
   * Returns active contacts for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await supplierContactService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /supplier-contacts/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await supplierContactService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /supplier-contacts
   * Validates request payload and creates a supplier contact record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createSupplierContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await supplierContactService.create(companyId, parsed.data);
    logger.info({ contactId: row.id }, "SupplierContact created");
    res.status(201).json(row);
  }

  /**
   * PUT /supplier-contacts/:id
   * Validates request payload and updates the contact.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateSupplierContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await supplierContactService.update(companyId, id, parsed.data);
    logger.info({ contactId: row.id }, "SupplierContact updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /supplier-contacts/:id
   * Soft-deletes the contact.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await supplierContactService.remove(companyId, id);
    logger.info({ contactId: req.params.id }, "SupplierContact soft-deleted");
    res.status(204).send();
  }
}

export const supplierContactController = new SupplierContactController();
