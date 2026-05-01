import { type Request, type Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { createPermissionSchema, updatePermissionSchema } from "./permission.schema";
import { permissionService } from "./permission.service";

/**
 * HTTP controller for permission endpoints.
 */
class PermissionController {
  /**
   * GET /permissions
   * Returns permissions catalog.
   */
  async list(_req: Request, res: Response): Promise<void> {
    const permissions = await permissionService.list();
    res.status(200).json(permissions);
  }

  /**
   * GET /permissions/:id
   * Returns one permission by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const permission = await permissionService.getById(id);
    res.status(200).json(permission);
  }

  /**
   * POST /permissions
   * Creates one permission after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createPermissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const permission = await permissionService.create(parsed.data);
    logger.info({ permissionId: permission.id }, "Permission created");
    res.status(201).json(permission);
  }

  /**
   * PUT /permissions/:id
   * Updates one permission after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updatePermissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const id = BigInt(req.params.id);
    const permission = await permissionService.update(id, parsed.data);
    logger.info({ permissionId: permission.id }, "Permission updated");
    res.status(200).json(permission);
  }

  /**
   * DELETE /permissions/:id
   * Deletes one permission when possible.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    await permissionService.remove(id);
    logger.info({ permissionId: req.params.id }, "Permission deleted");
    res.status(204).send();
  }
}

export const permissionController = new PermissionController();
