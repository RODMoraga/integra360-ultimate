import { type Request, type Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { createDocumentTypeSchema, updateDocumentTypeSchema } from "./document_type.schema";
import { documentTypeService } from "./document_type.service";

/**
 * HTTP controller for document type endpoints.
 */
class DocumentTypeController {
  /**
   * GET /document-types
   * Returns document types catalog.
   */
  async list(_req: Request, res: Response): Promise<void> {
    const rows = await documentTypeService.list();
    res.status(200).json(rows);
  }

  /**
   * GET /document-types/:id
   * Returns one document type by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const row = await documentTypeService.getById(id);
    res.status(200).json(row);
  }

  /**
   * POST /document-types
   * Creates one document type after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createDocumentTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const row = await documentTypeService.create(parsed.data);
    logger.info({ documentTypeId: row.id }, "DocumentType created");
    res.status(201).json(row);
  }

  /**
   * PUT /document-types/:id
   * Updates one document type after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateDocumentTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const id = BigInt(req.params.id);
    const row = await documentTypeService.update(id, parsed.data);
    logger.info({ documentTypeId: row.id }, "DocumentType updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /document-types/:id
   * Deletes one document type when possible.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    await documentTypeService.remove(id);
    logger.info({ documentTypeId: req.params.id }, "DocumentType deleted");
    res.status(204).send();
  }
}

export const documentTypeController = new DocumentTypeController();
