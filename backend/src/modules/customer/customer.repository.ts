import { prisma } from "../../config/database";

/**
 * Contract for creating a customer row in the database.
 */
export interface CreateCustomerInput {
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
  credit_limit?: number;
  is_active?: boolean;
  created_by?: bigint;
}

/**
 * Contract for partial customer updates.
 */
export interface UpdateCustomerInput {
  tax_id?: string;
  legal_name?: string;
  business_activity?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: bigint;
  payment_terms_days?: number;
  credit_limit?: number;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `customers`.
 */
class CustomerRepository {
  /**
   * Retrieves active customers for one company.
   */
  findAll(companyId: bigint) {
    return prisma.customers.findMany({
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
            customer_contacts: true,
            documents: true,
            sales: true
          }
        }
      },
      orderBy: { legal_name: "asc" }
    });
  }

  /**
   * Finds one active customer by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.customers.findFirst({
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
            customer_contacts: true,
            documents: true,
            sales: true
          }
        }
      }
    });
  }

  /**
   * Finds an active customer by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.customers.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds an active customer by company and tax id.
   */
  findByTaxId(companyId: bigint, taxId: string, excludeId?: bigint) {
    return prisma.customers.findFirst({
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
   * Persists a new customer.
   */
  create(data: CreateCustomerInput) {
    return prisma.customers.create({ data });
  }

  /**
   * Updates one customer in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateCustomerInput) {
    return prisma.customers.updateMany({
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
   * Soft-deletes one customer.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.customers.updateMany({
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

export const customerRepository = new CustomerRepository();
