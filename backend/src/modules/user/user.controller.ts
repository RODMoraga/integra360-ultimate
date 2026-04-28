import { Request, Response } from "express";
import { userService } from "./user.service";
import { createUserSchema, updateUserSchema } from "./user.schema";
import { AppError } from "../../common/errors/app-error";
import { logger } from "../../config/logger";

/**
 * HTTP controller for user endpoints.
 */
class UserController {
  /**
   * GET /users
   * Returns users for the authenticated user's company.
   */
  async list(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const users = await userService.listUsers(companyId);
    res.status(200).json(users);
  }

  /**
   * GET /users/roles
   * Returns assignable roles for current company.
   */
  async listRoles(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const roles = await userService.listRoles(companyId);
    res.status(200).json(roles);
  }

  /**
   * GET /users/:id
   * Returns one user by identifier.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    const user = await userService.getById(companyId, id);
    res.status(200).json(user);
  }

  /**
   * POST /users
   * Creates a user after payload validation.
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const createdBy = req.user?.id ? BigInt(req.user.id) : undefined;

    const user = await userService.create(companyId, parsed.data, createdBy);
    logger.info({ userId: user.id }, "User created");
    res.status(201).json(user);
  }

  /**
   * PUT /users/:id
   * Updates user fields after payload validation.
   */
  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((error) => error.message).join(", ");
      throw new AppError(messages, 400);
    }

    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);

    const user = await userService.update(companyId, id, parsed.data);
    logger.info({ userId: user.id }, "User updated");
    res.status(200).json(user);
  }

  /**
   * DELETE /users/:id
   * Applies soft-delete semantics over the requested user.
   */
  async remove(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);
    const id = BigInt(req.params.id);
    await userService.remove(companyId, id);
    logger.info({ userId: req.params.id }, "User soft-deleted");
    res.status(204).send();
  }
}

export const userController = new UserController();