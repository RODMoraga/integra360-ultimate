import { prisma } from "../../config/database";

/**
 * Contract for creating role records.
 */
export interface CreateRoleInput {
  companyId: bigint;
  code: string;
  name: string;
  description?: string;
  createdBy?: bigint;
  permissionIds?: bigint[];
}

/**
 * Contract for partial role updates.
 */
export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: bigint[];
}

/**
 * Repository for role and permission persistence operations.
 */
class RoleRepository {
  /**
   * Lists active roles for a company with aggregated relations.
   */
  findAll(companyId: bigint) {
    return prisma.roles.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        role_permissions: {
          select: {
            permissions: {
              select: {
                id: true,
                code: true,
                name: true,
                module_name: true
              }
            }
          }
        },
        _count: {
          select: {
            user_roles: true
          }
        }
      },
      orderBy: [{ is_system: "desc" }, { id: "desc" }]
    });
  }

  /**
   * Finds one role by id within company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.roles.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        role_permissions: {
          select: {
            permissions: {
              select: {
                id: true,
                code: true,
                name: true,
                module_name: true
              }
            }
          }
        },
        _count: {
          select: {
            user_roles: true
          }
        }
      }
    });
  }

  /**
   * Finds one active role by code and company.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.roles.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Lists available permissions ordered by module and name.
   */
  listPermissions() {
    return prisma.permissions.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        module_name: true,
        description: true
      },
      orderBy: [{ module_name: "asc" }, { name: "asc" }]
    });
  }

  /**
   * Creates one role and optional permission assignments.
   */
  async create(input: CreateRoleInput) {
    return prisma.$transaction(async (tx) => {
      const role = await tx.roles.create({
        data: {
          company_id: input.companyId,
          code: input.code,
          name: input.name,
          description: input.description,
          created_by: input.createdBy
        }
      });

      if (input.permissionIds && input.permissionIds.length > 0) {
        await tx.role_permissions.createMany({
          data: input.permissionIds.map((permissionId) => ({
            role_id: role.id,
            permission_id: permissionId,
            granted_by: input.createdBy
          }))
        });
      }

      return tx.roles.findFirst({
        where: {
          id: role.id,
          company_id: input.companyId,
          deleted_at: null
        },
        include: {
          role_permissions: {
            select: {
              permissions: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  module_name: true
                }
              }
            }
          },
          _count: {
            select: {
              user_roles: true
            }
          }
        }
      });
    });
  }

  /**
   * Updates one role and synchronizes permission assignments when provided.
   */
  async update(companyId: bigint, id: bigint, input: UpdateRoleInput) {
    return prisma.$transaction(async (tx) => {
      await tx.roles.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          updated_at: new Date()
        }
      });

      if (input.permissionIds !== undefined) {
        await tx.role_permissions.deleteMany({ where: { role_id: id } });

        if (input.permissionIds.length > 0) {
          await tx.role_permissions.createMany({
            data: input.permissionIds.map((permissionId) => ({
              role_id: id,
              permission_id: permissionId
            }))
          });
        }
      }

      return tx.roles.findFirst({
        where: {
          id,
          company_id: companyId,
          deleted_at: null
        },
        include: {
          role_permissions: {
            select: {
              permissions: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  module_name: true
                }
              }
            }
          },
          _count: {
            select: {
              user_roles: true
            }
          }
        }
      });
    });
  }

  /**
   * Soft-deletes one role.
   */
  softDelete(id: bigint) {
    return prisma.roles.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }
}

export const roleRepository = new RoleRepository();
