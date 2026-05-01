import { prisma } from "../../config/database";

/**
 * Contract for creating a warehouse row in the database.
 */
export interface CreateWarehouseInput {
  company_id: bigint;
  code: string;
  name: string;
  address_line?: string;
  commune_id?: bigint;
  is_main?: boolean;
  is_active?: boolean;
}

/**
 * Contract for partial warehouse updates.
 */
export interface UpdateWarehouseInput {
  name?: string;
  address_line?: string;
  commune_id?: bigint;
  is_main?: boolean;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `warehouses`.
 */
class WarehouseRepository {
  /**
   * Retrieves active warehouses for one company.
   */
  findAll(companyId: bigint) {
    return prisma.warehouses.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        communes: {
          include: {
            cities: {
              include: {
                regions: true
              }
            }
          }
        },
        _count: {
          select: {
            inventory: true,
            documents: true,
            document_details: true,
            pos_terminals: true,
            sale_details: true,
            inventory_movements_inventory_movements_warehouse_idTowarehouses: true,
            inventory_movements_inventory_movements_related_warehouse_idTowarehouses: true
          }
        }
      },
      orderBy: [{ is_main: "desc" }, { name: "asc" }]
    });
  }

  /**
   * Finds one active warehouse by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.warehouses.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        communes: {
          include: {
            cities: {
              include: {
                regions: true
              }
            }
          }
        },
        _count: {
          select: {
            inventory: true,
            documents: true,
            document_details: true,
            pos_terminals: true,
            sale_details: true,
            inventory_movements_inventory_movements_warehouse_idTowarehouses: true,
            inventory_movements_inventory_movements_related_warehouse_idTowarehouses: true
          }
        }
      }
    });
  }

  /**
   * Finds an active warehouse by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.warehouses.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Checks if commune exists.
   */
  findCommuneById(id: bigint) {
    return prisma.communes.findFirst({ where: { id } });
  }

  /**
   * Persists a new warehouse.
   */
  create(data: CreateWarehouseInput) {
    return prisma.warehouses.create({ data });
  }

  /**
   * Updates one warehouse in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateWarehouseInput) {
    return prisma.warehouses.updateMany({
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
   * Sets all active warehouses as not-main in company scope.
   */
  clearMainForCompany(companyId: bigint, excludeId?: bigint) {
    return prisma.warehouses.updateMany({
      where: {
        company_id: companyId,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      data: {
        is_main: false,
        updated_at: new Date()
      }
    });
  }

  /**
   * Soft-deletes one warehouse.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.warehouses.updateMany({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        is_active: false,
        is_main: false,
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }
}

export const warehouseRepository = new WarehouseRepository();
