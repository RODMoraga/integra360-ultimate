import { prisma } from "../../config/database";

/**
 * Contract for creating a supplier row in the database.
 */
export interface CreateSupplierInput {
  company_id: bigint;
  code: string;
  tax_id?: string;
  legal_name: string;
  business_activity?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: bigint;
  payment_terms_days?: number;
  is_active?: boolean;
  created_by?: bigint;
}

/**
 * Contract for partial supplier updates.
 */
export interface UpdateSupplierInput {
  tax_id?: string;
  legal_name?: string;
  business_activity?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: bigint;
  payment_terms_days?: number;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `suppliers`.
 */
class SupplierRepository {
  /**
   * Retrieves active suppliers for one company.
   */
  findAll(companyId: bigint) {
    return prisma.suppliers.findMany({
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
            supplier_contacts: true,
            documents: true
          }
        }
      },
      orderBy: { legal_name: "asc" }
    });
  }

  /**
   * Finds one active supplier by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.suppliers.findFirst({
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
            supplier_contacts: true,
            documents: true
          }
        }
      }
    });
  }

  /**
   * Finds an active supplier by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.suppliers.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds an active supplier by company and tax id.
   */
  findByTaxId(companyId: bigint, taxId: string, excludeId?: bigint) {
    return prisma.suppliers.findFirst({
      where: {
        company_id: companyId,
        tax_id: taxId,
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
   * Persists a new supplier.
   */
  create(data: CreateSupplierInput) {
    return prisma.suppliers.create({ data });
  }

  /**
   * Updates one supplier in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateSupplierInput) {
    return prisma.suppliers.updateMany({
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
   * Soft-deletes one supplier.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.suppliers.updateMany({
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

export const supplierRepository = new SupplierRepository();

