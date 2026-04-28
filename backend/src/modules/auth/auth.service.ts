import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import { userRepository } from "../user/user.repository";

/**
 * Application service responsible for authentication workflows.
 */
export class AuthService {
  /**
   * Registers a new user in the requested company and returns an access token.
   * @throws AppError when email already exists.
   */
  async register(input: { fullName: string; email: string; password: string; companyId: bigint }) {
    const existing = await userRepository.findByEmail(input.companyId, input.email);
    if (existing) {
      throw new AppError("Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      companyId: input.companyId
    });

    return this.signToken({ id: Number(user.id), email: user.email, companyId: Number(user.company_id) });
  }

  /**
   * Validates credentials and returns an access token.
   * @throws AppError when credentials are invalid or user is inactive.
   */
  async login(input: { companyId: bigint; email: string; password: string }) {
    const user = await userRepository.findByEmail(input.companyId, input.email);
    if (!user || !user.is_active) {
      throw new AppError("Invalid credentials", 401);
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) {
      throw new AppError("Invalid credentials", 401);
    }

    return this.signToken({ id: Number(user.id), email: user.email, companyId: Number(user.company_id) });
  }

  /**
   * Signs a JWT used by the API authorization middleware.
   */
  private signToken(payload: { id: number; email: string; companyId: number }) {
    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    });
    return {
      accessToken: token,
      tokenType: "Bearer"
    };
  }
}

export const authService = new AuthService();