import { prisma } from "../../config/database";

/**
 * Contract for permission creation payload.
 */
export interface CreatePermissionInput {
  code: string;
  name: string;
  module_name: string;
  description?: string;
}

/**
 * Contract for partial permission updates.
 */
export interface UpdatePermissionInput {
  name?: string;
  module_name?: string;
  description?: string;
}

/**
 * Repository layer for direct persistence operations over `permissions`.
 */
class PermissionRepository {
  /**
   * Retrieves all permissions ordered by module and code.
   */
  findAll() {
    return prisma.permissions.findMany({
      include: {
        _count: {
          select: {
            role_permissions: true
          }
        }
      },
      orderBy: [{ module_name: "asc" }, { code: "asc" }]
    });
  }

  /**
   * Finds one permission by id.
   */
  findById(id: bigint) {
    return prisma.permissions.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            role_permissions: true
          }
        }
      }
    });
  }

  /**
   * Finds one permission by code.
   */
  findByCode(code: string) {
    return prisma.permissions.findUnique({ where: { code } });
  }

  /**
   * Creates one permission record.
   */
  create(data: CreatePermissionInput) {
    const now = new Date();
    return prisma.permissions.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      },
      include: {
        _count: {
          select: {
            role_permissions: true
          }
        }
      }
    });
  }

  /**
   * Updates one permission record.
   */
  update(id: bigint, data: UpdatePermissionInput) {
    return prisma.permissions.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: {
            role_permissions: true
          }
        }
      }
    });
  }

  /**
   * Deletes one permission record.
   */
  remove(id: bigint) {
    return prisma.permissions.delete({
      where: { id }
    });
  }
}

export const permissionRepository = new PermissionRepository();
