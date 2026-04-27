import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";
import { userRepository } from "../user/user.repository";

export class AuthService {
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

    return this.signToken({ id: Number(user.id), email: user.email });
  }

  async login(input: { companyId: bigint; email: string; password: string }) {
    const user = await userRepository.findByEmail(input.companyId, input.email);
    if (!user || !user.is_active) {
      throw new AppError("Invalid credentials", 401);
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) {
      throw new AppError("Invalid credentials", 401);
    }

    return this.signToken({ id: Number(user.id), email: user.email });
  }

  private signToken(payload: { id: number; email: string }) {
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