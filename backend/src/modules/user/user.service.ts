import bcrypt from "bcryptjs";
import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { userRepository } from "./user.repository";
import type { CreateUserDto, UpdateUserDto } from "./user.schema";

/**
 * Business layer for user operations and role assignments.
 */
class UserService {
  /**
   * Lists active users for the requested company.
   */
  async listUsers(companyId: bigint) {
    const rows = await userRepository.findAll(companyId);
    return rows.map((row) => this.serializeUser(row));
  }

  /**
   * Lists active roles available for user assignment.
   */
  async listRoles(companyId: bigint) {
    const roles = await userRepository.findActiveRoles(companyId).catch(() => []);
    return roles.map((role) => ({
      id: role.id.toString(),
      code: role.code,
      name: role.name
    }));
  }

  /**
   * Retrieves one user by id within the company scope.
   */
  async getById(companyId: bigint, id: bigint) {
    const user = await userRepository.findById(companyId, id);
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return this.serializeUser(user);
  }

  /**
   * Creates a user and optional role assignments.
   */
  async create(companyId: bigint, dto: CreateUserDto, createdBy?: bigint) {
    const existing = await userRepository.findByEmail(companyId, dto.email);
    if (existing) {
      throw new AppError("El email ya se encuentra registrado", 409);
    }

    const roleIds = await this.resolveRoleIds(companyId, dto.role_ids);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const created = await userRepository.create({
      companyId,
      fullName: dto.full_name,
      email: dto.email,
      passwordHash,
      isActive: dto.is_active,
      createdBy,
      roleIds
    });

    if (!created) {
      throw new AppError("No fue posible crear el usuario", 500);
    }

    return this.serializeUser(created);
  }

  /**
   * Updates mutable user fields and role assignments.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateUserDto) {
    await this.getById(companyId, id);

    if (dto.email) {
      const existing = await userRepository.findByEmail(companyId, dto.email, id);
      if (existing) {
        throw new AppError("El email ya se encuentra registrado", 409);
      }
    }

    const roleIds = dto.role_ids !== undefined
      ? await this.resolveRoleIds(companyId, dto.role_ids)
      : undefined;

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    const updated = await userRepository.update(companyId, id, {
      fullName: dto.full_name,
      email: dto.email,
      passwordHash,
      isActive: dto.is_active,
      roleIds
    });

    if (!updated) {
      throw new AppError("No fue posible actualizar el usuario", 500);
    }

    return this.serializeUser(updated);
  }

  /**
   * Soft-deletes a user.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await userRepository.softDelete(id);
  }

  /**
   * Validates provided role ids against company active roles.
   */
  private async resolveRoleIds(companyId: bigint, roleIds?: number[]) {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(roleIds)).map((id) => BigInt(id));
    const availableRoles = await userRepository.findActiveRoles(companyId);
    const availableMap = new Set(availableRoles.map((role) => role.id.toString()));

    const invalidRoles = uniqueIds.filter((roleId) => !availableMap.has(roleId.toString()));
    if (invalidRoles.length > 0) {
      throw new AppError("Uno o más roles no son válidos para la empresa", 400);
    }

    return uniqueIds;
  }

  /**
   * Serializes Prisma user entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serializeUser(user: any) {
    const roles = (user.user_roles ?? []).map((entry: { roles: { id: bigint; code: string; name: string } }) => ({
      id: entry.roles.id.toString(),
      code: entry.roles.code,
      name: entry.roles.name
    }));

    return {
      id: user.id.toString(),
      company_id: user.company_id.toString(),
      full_name: user.full_name,
      email: user.email,
      is_active: user.is_active,
      last_login_at: toUtcIsoString(user.last_login_at),
      created_at: toUtcIsoString(user.created_at),
      updated_at: toUtcIsoString(user.updated_at),
      role_ids: roles.map((role: { id: string }) => role.id),
      role_names: roles.map((role: { name: string }) => role.name),
      primary_role: roles[0]?.name ?? "Sin rol",
      roles
    };
  }
}

export const userService = new UserService();