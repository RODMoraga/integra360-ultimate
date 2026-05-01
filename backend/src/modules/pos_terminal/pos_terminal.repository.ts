import { prisma } from "../../config/database";

/**
 * Contract for creating a POS terminal row in the database.
 */
export interface CreatePosTerminalInput {
  company_id: bigint;
  warehouse_id: bigint;
  code: string;
  name: string;
  device_name?: string;
  serial_number?: string;
  is_active?: boolean;
}

/**
 * Contract for partial POS terminal updates.
 */
export interface UpdatePosTerminalInput {
  warehouse_id?: bigint;
  name?: string;
  device_name?: string;
  serial_number?: string;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `pos_terminals`.
 */
class PosTerminalRepository {
  /**
   * Retrieves active POS terminals for one company.
   */
  findAll(companyId: bigint) {
    return prisma.pos_terminals.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        warehouses: {
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
            cash_registers: true,
            sales: true
          }
        }
      },
      orderBy: [{ is_active: "desc" }, { name: "asc" }]
    });
  }

  /**
   * Finds one active POS terminal by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.pos_terminals.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        warehouses: {
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
            cash_registers: true,
            sales: true
          }
        }
      }
    });
  }

  /**
   * Finds an active POS terminal by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.pos_terminals.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds one active warehouse by id in company scope.
   */
  findWarehouseById(companyId: bigint, warehouseId: bigint) {
    return prisma.warehouses.findFirst({
      where: {
        id: warehouseId,
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

  /**
   * Persists a new POS terminal.
   */
  create(data: CreatePosTerminalInput) {
    return prisma.pos_terminals.create({ data });
  }

  /**
   * Updates one POS terminal in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdatePosTerminalInput) {
    return prisma.pos_terminals.updateMany({
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

  /**
   * Soft-deletes one POS terminal.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.pos_terminals.updateMany({
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

export const posTerminalRepository = new PosTerminalRepository();
