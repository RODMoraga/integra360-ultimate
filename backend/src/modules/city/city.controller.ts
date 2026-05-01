import { Request, Response } from "express";
import { cityService } from "./city.service";
import { createCitySchema, updateCitySchema } from "./city.schema";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";

/**
 * HTTP controller for city endpoints.
 */
class CityController {
  /**
   * GET /cities
   * Returns all cities.
   */
  async list(_req: Request, res: Response): Promise<void> {
    const cities = await cityService.list();
    res.status(200).json(cities);
  }

  /**
   * GET /cities/:id
   * Returns one city by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const city = await cityService.getById(id);
    res.status(200).json(city);
  }

  /**
   * POST /cities
   * Validates request payload and creates a city record.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createCitySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const city = await cityService.create({
      ...parsed.data,
      region_id: BigInt(parsed.data.region_id)
    });

    logger.info({ cityId: city.id }, "City created");
    res.status(201).json(city);
  }

  /**
   * PUT /cities/:id
   * Validates request payload and updates the requested city.
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const parsed = updateCitySchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new AppError(messages, 400);
    }

    const city = await cityService.update(id, parsed.data);
    logger.info({ cityId: city.id }, "City updated");
    res.status(200).json(city);
  }

  /**
   * DELETE /cities/:id
   * Hard-deletes a city if it has no associated communes.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    await cityService.remove(id);
    logger.info({ cityId: req.params.id }, "City deleted");
    res.status(204).send();
  }
}

export const cityController = new CityController();
