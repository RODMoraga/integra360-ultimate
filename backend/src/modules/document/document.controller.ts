import { type Request, type Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { createDocumentSchema, updateDocumentSchema } from "./document.schema";
import { documentService, documents_status } from "./document.service";

class DocumentController {
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);

    const statusQuery = typeof req.query.status === "string"
      ? req.query.status.toUpperCase()
      : undefined;

    const status = statusQuery && ["DRAFT", "CONFIRMED", "CANCELLED"].includes(statusQuery)
      ? statusQuery as documents_status
      : undefined;

    const dateFrom = typeof req.query.date_from === "string"
      ? new Date(`${req.query.date_from}T00:00:00.000Z`)
      : undefined;

    const dateTo = typeof req.query.date_to === "string"
      ? new Date(`${req.query.date_to}T23:59:59.999Z`)
      : undefined;

    const rows = await documentService.list(companyId, {
      partner_name: typeof req.query.partner_name === "string" ? req.query.partner_name.trim() : undefined,
      status,
      date_from: dateFrom && !Number.isNaN(dateFrom.getTime()) ? dateFrom : undefined,
      date_to: dateTo && !Number.isNaN(dateTo.getTime()) ? dateTo : undefined
    });

    res.status(200).json(rows);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await documentService.getById(companyId, id);
    res.status(200).json(row);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;
    const row = await documentService.create(companyId, parsed.data, createdBy);

    logger.info({ documentId: row.id, documentNumber: row.document_number_label }, "Document created");
    res.status(201).json(row);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await documentService.update(companyId, id, parsed.data);

    logger.info({ documentId: row.id, documentNumber: row.document_number_label }, "Document updated");
    res.status(200).json(row);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await documentService.remove(companyId, id);

    logger.info({ documentId: req.params.id }, "Document soft-deleted");
    res.status(204).send();
  }
}

export const documentController = new DocumentController();
