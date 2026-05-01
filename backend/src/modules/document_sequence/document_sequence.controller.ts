import { type Request, type Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { documentSequenceService } from "./document_sequence.service";
import { createDocumentSequenceSchema, updateDocumentSequenceSchema } from "./document_sequence.schema";

/**
 * HTTP controller for document sequence endpoints.
 */
class DocumentSequenceController {
  /**
   * GET /document-sequences
   * Returns sequences for authenticated company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await documentSequenceService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /document-sequences/:id
   * Returns one sequence by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await documentSequenceService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /document-sequences
   * Creates one sequence after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createDocumentSequenceSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const row = await documentSequenceService.create(companyId, parsed.data);
    logger.info({ documentSequenceId: row.id }, "DocumentSequence created");
    res.status(201).json(row);
  }

  /**
   * PUT /document-sequences/:id
   * Updates one sequence after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateDocumentSequenceSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await documentSequenceService.update(companyId, id, parsed.data);
    logger.info({ documentSequenceId: row.id }, "DocumentSequence updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /document-sequences/:id
   * Deletes one sequence.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await documentSequenceService.remove(companyId, id);
    logger.info({ documentSequenceId: req.params.id }, "DocumentSequence deleted");
    res.status(204).send();
  }
}

export const documentSequenceController = new DocumentSequenceController();
