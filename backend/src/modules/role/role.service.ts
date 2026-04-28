import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { roleRepository } from "./role.repository";
import type { CreateRoleDto, UpdateRoleDto } from "./role.schema";

/**
 * Business layer for roles and permission assignments.
 */
class RoleService {
  /**
   * Lists active roles for the requested company.
   */
  async list(companyId: bigint) {
    const rows = await roleRepository.findAll(companyId);
    return rows.map((row) => this.serializeRole(row));
  }

  /**
   * Returns one role by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const role = await roleRepository.findById(companyId, id);
    if (!role) {
      throw new AppError("Rol no encontrado", 404);
    }
    return this.serializeRole(role);
  }

  /**
   * Lists permissions available for role assignment.
   */
  async listPermissions() {
    const permissions = await roleRepository.listPermissions();
    return permissions.map((permission) => ({
      id: permission.id.toString(),
      code: permission.code,
      name: permission.name,
      module_name: permission.module_name,
      description: permission.description ?? null
    }));
  }

  /**
   * Creates one role and optional permission links.
   */
  async create(companyId: bigint, dto: CreateRoleDto, createdBy?: bigint) {
    const existing = await roleRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código del rol ya existe para la empresa", 409);
    }

    const permissionIds = await this.resolvePermissionIds(dto.permission_ids);

    const created = await roleRepository.create({
      companyId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      createdBy,
      permissionIds
    });

    if (!created) {
      throw new AppError("No fue posible crear el rol", 500);
    }

    return this.serializeRole(created);
  }

  /**
   * Updates one role excluding immutable/system-constrained data.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateRoleDto) {
    const role = await roleRepository.findById(companyId, id);
    if (!role) {
      throw new AppError("Rol no encontrado", 404);
    }

    if (role.is_system) {
      throw new AppError("No está permitido editar un rol de sistema", 403);
    }

    const permissionIds = dto.permission_ids !== undefined
      ? await this.resolvePermissionIds(dto.permission_ids)
      : undefined;

    const updated = await roleRepository.update(companyId, id, {
      name: dto.name,
      description: dto.description,
      permissionIds
    });

    if (!updated) {
      throw new AppError("No fue posible actualizar el rol", 500);
    }

    return this.serializeRole(updated);
  }

  /**
   * Soft-deletes one role when allowed.
   */
  async remove(companyId: bigint, id: bigint) {
    const role = await roleRepository.findById(companyId, id);
    if (!role) {
      throw new AppError("Rol no encontrado", 404);
    }

    if (role.is_system) {
      throw new AppError("No está permitido eliminar un rol de sistema", 403);
    }

    if (role._count.user_roles > 0) {
      throw new AppError("No se puede eliminar un rol asignado a usuarios", 409);
    }

    await roleRepository.softDelete(id);
  }

  /**
   * Validates permission ids against the permissions catalog.
   */
  private async resolvePermissionIds(permissionIds?: number[]) {
    if (!permissionIds || permissionIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(permissionIds)).map((id) => BigInt(id));
    const available = await roleRepository.listPermissions();
    const availableSet = new Set(available.map((permission) => permission.id.toString()));

    const invalidIds = uniqueIds.filter((id) => !availableSet.has(id.toString()));
    if (invalidIds.length > 0) {
      throw new AppError("Uno o más permisos no son válidos", 400);
    }

    return uniqueIds;
  }

  /**
   * Serializes Prisma role entities into API-safe JSON payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serializeRole(role: any) {
    const permissions = (role.role_permissions ?? []).map((entry: {
      permissions: { id: bigint; code: string; name: string; module_name: string };
    }) => ({
      id: entry.permissions.id.toString(),
      code: entry.permissions.code,
      name: entry.permissions.name,
      module_name: entry.permissions.module_name
    }));

    return {
      id: role.id.toString(),
      company_id: role.company_id.toString(),
      code: role.code,
      name: role.name,
      description: role.description ?? null,
      is_system: role.is_system,
      users_count: role._count?.user_roles ?? 0,
      permission_ids: permissions.map((permission: { id: string }) => permission.id),
      permission_codes: permissions.map((permission: { code: string }) => permission.code),
      permissions,
      created_at: toUtcIsoString(role.created_at),
      updated_at: toUtcIsoString(role.updated_at)
    };
  }
}

export const roleService = new RoleService();
