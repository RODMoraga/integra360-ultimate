import { prisma } from "../../config/database";

/**
 * Contract for creating a customer_contact row.
 */
export interface CreateCustomerContactInput {
  company_id: bigint;
  customer_id: bigint;
  full_name: string;
  email?: string;
  phone?: string;
  role_name?: string;
  is_primary?: boolean;
}

/**
 * Contract for partial customer_contact updates.
 * `customer_id` is intentionally immutable.
 */
export interface UpdateCustomerContactInput {
  full_name?: string;
  email?: string;
  phone?: string;
  role_name?: string;
  is_primary?: boolean;
}

/**
 * Repository layer for direct persistence operations over `customer_contacts`.
 */
class CustomerContactRepository {
  /**
   * Retrieves active contacts for one company, including customer name.
   */
  findAll(companyId: bigint) {
    return prisma.customer_contacts.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        customers: {
          select: { id: true, legal_name: true, code: true }
        }
      },
      orderBy: { full_name: "asc" }
    });
  }

  /**
   * Finds one active contact by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.customer_contacts.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      include: {
        customers: {
          select: { id: true, legal_name: true, code: true }
        }
      }
    });
  }

  /**
   * Inserts a new customer_contact row.
   */
  create(data: CreateCustomerContactInput) {
    const now = new Date();
    return prisma.customer_contacts.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  /**
   * Updates a customer_contact row and refreshes `updated_at`.
   */
  update(id: bigint, data: UpdateCustomerContactInput) {
    return prisma.customer_contacts.update({
      where: { id },
      data: { ...data, updated_at: new Date() }
    });
  }

  /**
   * Soft-deletes a customer_contact row.
   */
  softDelete(id: bigint) {
    return prisma.customer_contacts.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

export const customerContactRepository = new CustomerContactRepository();
