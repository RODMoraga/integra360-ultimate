import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { permissionRepository, type CreatePermissionInput, type UpdatePermissionInput } from "./permission.repository";

/**
 * Business layer for permission operations.
 */
class PermissionService {
  /**
   * Lists all permissions.
   */
  async list() {
    const rows = await permissionRepository.findAll();
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one permission by id.
   */
  async getById(id: bigint) {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new AppError("Permiso no encontrado", 404);
    }

    return this.serialize(permission);
  }

  /**
   * Creates one permission after unique-code validation.
   */
  async create(dto: CreatePermissionInput) {
    const existing = await permissionRepository.findByCode(dto.code);
    if (existing) {
      throw new AppError("El código del permiso ya existe", 409);
    }

    const created = await permissionRepository.create(dto);
    return this.serialize(created);
  }

  /**
   * Updates one permission.
   */
  async update(id: bigint, dto: UpdatePermissionInput) {
    await this.getById(id);
    const updated = await permissionRepository.update(id, dto);
    return this.serialize(updated);
  }

  /**
   * Deletes one permission if it is not assigned to any role.
   */
  async remove(id: bigint) {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new AppError("Permiso no encontrado", 404);
    }

    if ((permission._count?.role_permissions ?? 0) > 0) {
      throw new AppError("No se puede eliminar un permiso asignado a roles", 409);
    }

    await permissionRepository.remove(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(permission: any) {
    return {
      id: permission.id.toString(),
      code: permission.code,
      name: permission.name,
      module_name: permission.module_name,
      description: permission.description ?? null,
      roles_count: permission._count?.role_permissions ?? 0,
      created_at: toUtcIsoString(permission.created_at),
      updated_at: toUtcIsoString(permission.updated_at)
    };
  }
}

export const permissionService = new PermissionService();
