import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { customerContactService } from "./customer_contact.service";
import { createCustomerContactSchema, updateCustomerContactSchema } from "./customer_contact.schema";

/**
 * HTTP controller for customer_contacts endpoints.
 */
class CustomerContactController {
  /**
   * GET /customer-contacts
   * Returns active contacts for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await customerContactService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /customer-contacts/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await customerContactService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /customer-contacts
   * Validates request payload and creates a customer contact record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCustomerContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await customerContactService.create(companyId, parsed.data);
    logger.info({ contactId: row.id }, "CustomerContact created");
    res.status(201).json(row);
  }

  /**
   * PUT /customer-contacts/:id
   * Validates request payload and updates the contact.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateCustomerContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await customerContactService.update(companyId, id, parsed.data);
    logger.info({ contactId: row.id }, "CustomerContact updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /customer-contacts/:id
   * Soft-deletes the contact.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await customerContactService.remove(companyId, id);
    logger.info({ contactId: req.params.id }, "CustomerContact soft-deleted");
    res.status(204).send();
  }
}

export const customerContactController = new CustomerContactController();
