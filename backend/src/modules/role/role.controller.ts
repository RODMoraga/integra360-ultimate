import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";
import { roleService } from "./role.service";
import { createRoleSchema, updateRoleSchema } from "./role.schema";

/**
 * HTTP controller for roles endpoints.
 */
class RoleController {
  /**
   * GET /roles
   * Returns active roles for authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const roles = await roleService.list(companyId);
    res.status(200).json(roles);
  }

  /**
   * GET /roles/permissions
   * Returns permissions catalog for role assignment UI.
   */
  async listPermissions(_req: Request, res: Response): Promise<void> {
    const permissions = await roleService.listPermissions();
    res.status(200).json(permissions);
  }

  /**
   * GET /roles/:id
   * Returns one role by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const role = await roleService.getById(companyId, id);
    res.status(200).json(role);
  }

  /**
   * POST /roles
   * Creates one role after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;
    const role = await roleService.create(companyId, parsed.data, createdBy);
    logger.info({ roleId: role.id }, "Role created");
    res.status(201).json(role);
  }

  /**
   * PUT /roles/:id
   * Updates one role after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const role = await roleService.update(companyId, id, parsed.data);
    logger.info({ roleId: role.id }, "Role updated");
    res.status(200).json(role);
  }

  /**
   * DELETE /roles/:id
   * Applies soft-delete semantics over one role.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await roleService.remove(companyId, id);
    logger.info({ roleId: req.params.id }, "Role soft-deleted");
    res.status(204).send();
  }
}

export const roleController = new RoleController();
