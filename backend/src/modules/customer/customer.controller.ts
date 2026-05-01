import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { customerService } from "./customer.service";
import { createCustomerSchema, updateCustomerSchema } from "./customer.schema";

/**
 * HTTP controller for customer endpoints.
 */
class CustomerController {
  /**
   * GET /customers
   * Returns active customers for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await customerService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /customers/:id
   * Returns one customer by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await customerService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /customers
   * Creates one customer after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;
    const row = await customerService.create(companyId, { ...parsed.data, created_by: createdBy });
    logger.info({ customerId: row.id }, "Customer created");
    res.status(201).json(row);
  }

  /**
   * PUT /customers/:id
   * Updates one customer after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await customerService.update(companyId, id, parsed.data);
    logger.info({ customerId: row.id }, "Customer updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /customers/:id
   * Soft-deletes one customer.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await customerService.remove(companyId, id);
    logger.info({ customerId: req.params.id }, "Customer soft-deleted");
    res.status(204).send();
  }
}

export const customerController = new CustomerController();
