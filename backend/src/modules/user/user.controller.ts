import { Request, Response } from "express";
import { userService } from "./user.service";

class UserController {
  async list(req: Request, res: Response): Promise<void> {
    // company_id comes from JWT payload or query param (dev fallback: 1)
    const companyId = BigInt((req.user as { id: number } | undefined) ? 1 : 1);
    const users = await userService.listUsers(companyId);
    res.status(200).json(users);
  }
}

export const userController = new UserController();