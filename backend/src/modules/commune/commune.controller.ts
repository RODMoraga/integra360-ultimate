import { Request, Response } from "express";
import { communeService } from "./commune.service";
import { createCommuneSchema, updateCommuneSchema } from "./commune.schema";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";

/**
 * HTTP controller for commune endpoints.
 */
class CommuneController {
  /**
   * GET /communes
   * Returns all communes.
   */
  async list(_req: Request, res: Response): Promise<void> {
    const communes = await communeService.list();
    res.status(200).json(communes);
  }

  /**
   * GET /communes/:id
   * Returns one commune by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const commune = await communeService.getById(id);
    res.status(200).json(commune);
  }

  /**
   * POST /communes
   * Validates request payload and creates a commune record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCommuneSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const commune = await communeService.create({
      city_id: BigInt(parsed.data.city_id),
      code: parsed.data.code,
      name: parsed.data.name,
      postal_code: parsed.data.postal_code || undefined
    });

    logger.info({ communeId: commune.id }, "Commune created");
    res.status(201).json(commune);
  }

  /**
   * PUT /communes/:id
   * Validates request payload and updates the requested commune.
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const parsed = updateCommuneSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const commune = await communeService.update(id, {
      ...parsed.data,
      postal_code: parsed.data.postal_code || undefined
    });
    logger.info({ communeId: commune.id }, "Commune updated");
    res.status(200).json(commune);
  }

  /**
   * DELETE /communes/:id
   * Hard-deletes a commune if it has no dependent records.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    await communeService.remove(id);
    logger.info({ communeId: req.params.id }, "Commune deleted");
    res.status(204).send();
  }
}

export const communeController = new CommuneController();
