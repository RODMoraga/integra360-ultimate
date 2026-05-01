import { prisma } from "../../config/database";

/**
 * Contract for creating a supplier_contact row.
 */
export interface CreateSupplierContactInput {
  company_id: bigint;
  supplier_id: bigint;
  full_name: string;
  email?: string;
  phone?: string;
  role_name?: string;
  is_primary?: boolean;
}

/**
 * Contract for partial supplier_contact updates.
 * `supplier_id` is intentionally immutable.
 */
export interface UpdateSupplierContactInput {
  full_name?: string;
  email?: string;
  phone?: string;
  role_name?: string;
  is_primary?: boolean;
}

/**
 * Repository layer for direct persistence operations over `supplier_contacts`.
 */
class SupplierContactRepository {
  /**
   * Retrieves active contacts for one company, including supplier name.
   */
  findAll(companyId: bigint) {
    return prisma.supplier_contacts.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        suppliers: {
          select: { id: true, legal_name: true, code: true }
        }
      },
      orderBy: { full_name: "asc" }
    });
  }

  /**
   * Finds one active contact by id within company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.supplier_contacts.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      include: {
        suppliers: {
          select: { id: true, legal_name: true, code: true }
        }
      }
    });
  }

  /**
   * Inserts a new supplier_contact row.
   */
  create(data: CreateSupplierContactInput) {
    const now = new Date();
    return prisma.supplier_contacts.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  /**
   * Updates a supplier_contact row and refreshes `updated_at`.
   */
  update(id: bigint, data: UpdateSupplierContactInput) {
    return prisma.supplier_contacts.update({
      where: { id },
      data: { ...data, updated_at: new Date() }
    });
  }

  /**
   * Soft-deletes a supplier_contact row.
   */
  softDelete(id: bigint) {
    return prisma.supplier_contacts.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

export const supplierContactRepository = new SupplierContactRepository();
