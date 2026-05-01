import { prisma } from "../../config/database";

export interface CreateCashRegisterInput {
  company_id: bigint;
  terminal_id: bigint;
  code: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateCashRegisterInput {
  terminal_id?: bigint;
  name?: string;
  is_active?: boolean;
}

class CashRegisterRepository {
  findAll(companyId: bigint) {
    return prisma.cash_registers.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        pos_terminals: {
          select: {
            id: true,
            code: true,
            name: true,
            is_active: true,
            deleted_at: true
          }
        },
        _count: {
          select: {
            cash_openings: true
          }
        }
      },
      orderBy: [{ is_active: "desc" }, { name: "asc" }]
    });
  }

  findById(companyId: bigint, id: bigint) {
    return prisma.cash_registers.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        pos_terminals: {
          select: {
            id: true,
            code: true,
            name: true,
            is_active: true,
            deleted_at: true
          }
        },
        _count: {
          select: {
            cash_openings: true
          }
        }
      }
    });
  }

  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.cash_registers.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  findTerminalById(companyId: bigint, terminalId: bigint) {
    return prisma.pos_terminals.findFirst({
      where: {
        id: terminalId,
        company_id: companyId,
        deleted_at: null,
        is_active: true
      },
      select: {
        id: true,
        code: true,
        name: true
      }
    });
  }

  create(data: CreateCashRegisterInput) {
    return prisma.cash_registers.create({ data });
  }

  update(companyId: bigint, id: bigint, data: UpdateCashRegisterInput) {
    return prisma.cash_registers.updateMany({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  }

  softDelete(companyId: bigint, id: bigint) {
    return prisma.cash_registers.updateMany({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }
}

export const cashRegisterRepository = new CashRegisterRepository();
