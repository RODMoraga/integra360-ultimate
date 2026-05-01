import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { posTerminalService } from "./pos_terminal.service";
import { createPosTerminalSchema, updatePosTerminalSchema } from "./pos_terminal.schema";

/**
 * HTTP controller for POS terminal endpoints.
 */
class PosTerminalController {
  /**
   * GET /pos-terminals
   * Returns active POS terminals for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await posTerminalService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /pos-terminals/:id
   * Returns one POS terminal by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await posTerminalService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /pos-terminals
   * Creates one POS terminal after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createPosTerminalSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await posTerminalService.create(companyId, parsed.data);
    logger.info({ posTerminalId: row.id }, "POS terminal created");
    res.status(201).json(row);
  }

  /**
   * PUT /pos-terminals/:id
   * Updates one POS terminal after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updatePosTerminalSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await posTerminalService.update(companyId, id, parsed.data);
    logger.info({ posTerminalId: row.id }, "POS terminal updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /pos-terminals/:id
   * Soft-deletes one POS terminal.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await posTerminalService.remove(companyId, id);
    logger.info({ posTerminalId: req.params.id }, "POS terminal soft-deleted");
    res.status(204).send();
  }
}

export const posTerminalController = new PosTerminalController();
