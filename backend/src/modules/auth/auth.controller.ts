import { Request, Response } from "express";
import { authService } from "./auth.service";

/**
 * HTTP controller for authentication endpoints.
 */
class AuthController {
  /**
   * POST /auth/register
   * Creates a user account and returns token payload.
   */
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }

  /**
   * POST /auth/login
   * Validates credentials and returns token payload.
   */
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }
}

export const authController = new AuthController();