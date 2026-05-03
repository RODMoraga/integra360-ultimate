import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

/**
 * Contract for creating user rows and role assignments.
 */
export interface CreateUserInput {
  companyId: bigint;
  fullName: string;
  email: string;
  passwordHash: string;
  isActive?: boolean;
  createdBy?: bigint;
  roleIds?: bigint[];
}

/**
 * Contract for partial user updates.
 */
export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  passwordHash?: string;
  isActive?: boolean;
  roleIds?: bigint[];
}

/**
 * Repository for user and user-role persistence operations.
 */
class UserRepository {
  /**
   * Finds one active user by company and email.
   */
  findByEmail(companyId: bigint, email: string, excludeId?: bigint) {
    return prisma.users.findFirst({
      where: {
        company_id: companyId,
        email,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Lists active roles available for a company.
   */
  findActiveRoles(companyId: bigint) {
    return prisma.roles.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      select: {
        id: true,
        code: true,
        name: true
      },
      orderBy: [{ is_system: "desc" }, { name: "asc" }]
    });
  }

  /**
   * Finds one user by id in the requested company, including assigned roles.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.users.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        user_roles: {
          select: {
            roles: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      }
    }).catch(() => {
      return prisma.users.findFirst({
        where: {
          id,
          company_id: companyId,
          deleted_at: null
        }
      });
    });
  }

  /**
   * Returns auth-sensitive fields for one user in company scope.
   */
  findAuthById(companyId: bigint, id: bigint) {
    return prisma.users.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      select: {
        id: true,
        company_id: true,
        email: true,
        is_active: true,
        password_hash: true
      }
    });
  }

  /**
   * Creates a user record and optional role assignments.
   */
  async create(input: CreateUserInput) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const user = await tx.users.create({
        data: {
          company_id: input.companyId,
          full_name: input.fullName,
          email: input.email,
          password_hash: input.passwordHash,
          is_active: input.isActive ?? true,
          created_by: input.createdBy,
          created_at: now,
          updated_at: now
        }
      });

      if (input.roleIds && input.roleIds.length > 0) {
        await tx.user_roles.createMany({
          data: input.roleIds.map((roleId) => ({
            user_id: user.id,
            role_id: roleId,
            assigned_by: input.createdBy
          }))
        });
      }

      return tx.users.findUnique({
        where: { id: user.id },
        include: {
          user_roles: {
            select: {
              roles: {
                select: {
                  id: true,
                  code: true,
                  name: true
                }
              }
            }
          }
        }
      }).catch(() => tx.users.findUnique({ where: { id: user.id } }));
    });
  }

  /**
   * Updates a user and synchronizes role assignments when provided.
   */
  async update(companyId: bigint, id: bigint, input: UpdateUserInput) {
    return prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id },
        data: {
          ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
          ...(input.passwordHash !== undefined ? { password_hash: input.passwordHash } : {}),
          ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
          updated_at: new Date()
        }
      });

      if (input.roleIds !== undefined) {
        await tx.user_roles.deleteMany({ where: { user_id: id } });

        if (input.roleIds.length > 0) {
          await tx.user_roles.createMany({
            data: input.roleIds.map((roleId) => ({
              user_id: id,
              role_id: roleId
            }))
          });
        }
      }

      return tx.users.findFirst({
        where: {
          id,
          company_id: companyId,
          deleted_at: null
        },
        include: {
          user_roles: {
            select: {
              roles: {
                select: {
                  id: true,
                  code: true,
                  name: true
                }
              }
            }
          }
        }
      }).catch(() => {
        return tx.users.findFirst({
          where: {
            id,
            company_id: companyId,
            deleted_at: null
          }
        });
      });
    });
  }

  /**
   * Updates only the password hash for one user.
   */
  updatePassword(companyId: bigint, id: bigint, passwordHash: string) {
    return prisma.users.updateMany({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        password_hash: passwordHash,
        updated_at: new Date()
      }
    });
  }

  /**
   * Soft-deletes a user and clears active state.
   */
  softDelete(id: bigint) {
    return prisma.users.update({
      where: { id },
      data: {
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  /**
   * Lists active users for the provided company, including assigned roles.
   */
  findAll(companyId: bigint) {
    return prisma.users.findMany({
      where: { company_id: companyId, deleted_at: null },
      include: {
        user_roles: {
          select: {
            roles: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    }).catch(() => {
      return prisma.users.findMany({
        where: { company_id: companyId, deleted_at: null },
        orderBy: { id: "desc" }
      });
    });
  }

  /**
   * Persists audit trace for authenticated self-profile updates.
   */
  createSelfProfileAuditLog(input: {
    companyId: bigint;
    userId: bigint;
    oldData: Prisma.JsonObject;
    newData: Prisma.JsonObject;
    changedFields: string[];
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.audit_logs.create({
      data: {
        company_id: input.companyId,
        table_name: "users",
        row_pk: input.userId.toString(),
        action_type: "UPDATE",
        changed_by: input.userId,
        changed_at: new Date(),
        old_data: input.oldData,
        new_data: {
          ...input.newData,
          changed_fields: input.changedFields
        },
        ip_address: input.ipAddress,
        user_agent: input.userAgent
      }
    });
  }

  /**
   * Returns latest audit logs for one user's profile changes.
   */
  findSelfProfileAuditLogs(companyId: bigint, userId: bigint, limit = 50) {
    return prisma.audit_logs.findMany({
      where: {
        company_id: companyId,
        table_name: "users",
        row_pk: userId.toString(),
        action_type: "UPDATE"
      },
      orderBy: {
        changed_at: "desc"
      },
      take: limit,
      select: {
        id: true,
        changed_by: true,
        changed_at: true,
        old_data: true,
        new_data: true,
        ip_address: true,
        user_agent: true
      }
    });
  }
}

export const userRepository = new UserRepository();