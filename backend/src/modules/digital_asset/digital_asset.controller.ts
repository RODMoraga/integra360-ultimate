import { type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { digitalAssetService } from "./digital_asset.service";
import { createDigitalAssetSchema, updateDigitalAssetSchema } from "./digital_asset.schema";

/**
 * HTTP controller for digital asset endpoints.
 */
class DigitalAssetController {
  /**
   * GET /digital-assets
   * Returns active digital assets for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const rows = await digitalAssetService.list(companyId);
    res.status(200).json(rows);
  }

  /**
   * GET /digital-assets/:id
   * Returns one digital asset by id in company scope.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await digitalAssetService.getById(companyId, id);
    res.status(200).json(row);
  }

  /**
   * POST /digital-assets
   * Creates one digital asset after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createDigitalAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;
    const row = await digitalAssetService.create(companyId, {
      ...parsed.data,
      created_by: createdBy,
      original_filename: parsed.data.original_filename || undefined,
      public_url: parsed.data.public_url || undefined,
      extension: parsed.data.extension || undefined,
      sha256_hash: parsed.data.sha256_hash || undefined,
      metadata_json: parsed.data.metadata_json as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined
    });

    logger.info({ digitalAssetId: row.id }, "DigitalAsset created");
    res.status(201).json(row);
  }

  /**
   * PUT /digital-assets/:id
   * Updates one digital asset after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateDigitalAssetSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const row = await digitalAssetService.update(companyId, id, {
      ...parsed.data,
      original_filename: parsed.data.original_filename === "" ? undefined : parsed.data.original_filename,
      public_url: parsed.data.public_url === "" ? undefined : parsed.data.public_url,
      extension: parsed.data.extension === "" ? undefined : parsed.data.extension,
      sha256_hash: parsed.data.sha256_hash === "" ? undefined : parsed.data.sha256_hash,
      metadata_json: parsed.data.metadata_json as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined
    });

    logger.info({ digitalAssetId: row.id }, "DigitalAsset updated");
    res.status(200).json(row);
  }

  /**
   * DELETE /digital-assets/:id
   * Soft-deletes one digital asset.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await digitalAssetService.remove(companyId, id);
    logger.info({ digitalAssetId: req.params.id }, "DigitalAsset soft-deleted");
    res.status(204).send();
  }
}

export const digitalAssetController = new DigitalAssetController();
