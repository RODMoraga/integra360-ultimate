import { prisma } from "../../config/database";

/**
 * Repository for user persistence operations.
 */
class UserRepository {
  /**
   * Finds one user by company and email.
   */
  findByEmail(companyId: bigint, email: string) {
    return prisma.users.findFirst({ where: { company_id: companyId, email } });
  }

  /**
   * Creates a user record in database.
   */
  create(input: { fullName: string; email: string; passwordHash: string; companyId: bigint }) {
    return prisma.users.create({
      data: {
        full_name: input.fullName,
        email: input.email,
        password_hash: input.passwordHash,
        company_id: input.companyId
      }
    });
  }

  /**
   * Lists active users for the provided company.
   */
  list(companyId: bigint) {
    return prisma.users.findMany({
      where: { company_id: companyId, deleted_at: null },
      select: {
        id: true,
        full_name: true,
        email: true,
        is_active: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { id: "desc" }
    });
  }
}

export const userRepository = new UserRepository();