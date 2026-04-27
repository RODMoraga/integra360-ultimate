import { prisma } from "../../config/database";

class UserRepository {
  findByEmail(companyId: bigint, email: string) {
    return prisma.users.findFirst({ where: { company_id: companyId, email } });
  }

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