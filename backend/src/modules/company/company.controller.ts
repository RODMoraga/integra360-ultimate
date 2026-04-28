import { Request, Response } from "express";
import { companyService } from "./company.service";
import { createCompanySchema, updateCompanySchema } from "./company.schema";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";

/**
 * HTTP controller for company endpoints.
 */
class CompanyController {
  /**
   * GET /companies
   * Returns all active companies.
   */
  async list(_req: Request, res: Response): Promise<void> {
    const companies = await companyService.list();
    res.status(200).json(companies);
  }

  /**
   * GET /companies/:id
   * Returns one company by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const company = await companyService.getById(id);
    res.status(200).json(company);
  }

  /**
   * POST /companies
   * Validates request payload and creates a company record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;
    const company = await companyService.create({ ...parsed.data, created_by: createdBy });
    logger.info({ companyId: company.id }, "Company created");
    res.status(201).json(company);
  }

  /**
   * PUT /companies/:id
   * Validates request payload and updates the requested company.
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const parsed = updateCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const company = await companyService.update(id, parsed.data);
    logger.info({ companyId: company.id }, "Company updated");
    res.status(200).json(company);
  }

  /**
   * DELETE /companies/:id
   * Applies soft-delete semantics over the requested company.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    await companyService.remove(id);
    logger.info({ companyId: req.params.id }, "Company soft-deleted");
    res.status(204).send();
  }
}

export const companyController = new CompanyController();
