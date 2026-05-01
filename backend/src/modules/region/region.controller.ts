import { Request, Response } from "express";
import { regionService } from "./region.service";
import { createRegionSchema, updateRegionSchema } from "./region.schema";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";

/**
 * HTTP controller for region endpoints.
 */
class RegionController {
  /**
   * GET /regions
   * Returns all regions.
   */
  async list(_req: Request, res: Response): Promise<void> {
    const regions = await regionService.list();
    res.status(200).json(regions);
  }

  /**
   * GET /regions/:id
   * Returns one region by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const region = await regionService.getById(id);
    res.status(200).json(region);
  }

  /**
   * POST /regions
   * Validates request payload and creates a region record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createRegionSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const region = await regionService.create(parsed.data);
    logger.info({ regionId: region.id }, "Region created");
    res.status(201).json(region);
  }

  /**
   * PUT /regions/:id
   * Validates request payload and updates the requested region.
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const parsed = updateRegionSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const region = await regionService.update(id, parsed.data);
    logger.info({ regionId: region.id }, "Region updated");
    res.status(200).json(region);
  }

  /**
   * DELETE /regions/:id
   * Hard-deletes a region if it has no associated cities.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    await regionService.remove(id);
    logger.info({ regionId: req.params.id }, "Region deleted");
    res.status(204).send();
  }
}

export const regionController = new RegionController();
