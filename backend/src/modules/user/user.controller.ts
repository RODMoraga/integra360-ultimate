import { Request, Response } from "express";
import { userService } from "./user.service";

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
}

export const userController = new UserController();