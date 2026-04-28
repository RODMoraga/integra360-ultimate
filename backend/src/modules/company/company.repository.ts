import { prisma } from "../../config/database";

/**
 * Contract for creating a company row in the database.
 */
export interface CreateCompanyInput {
  code: string;
  legal_name: string;
  trade_name?: string;
  tax_id: string;
  industry_type?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: bigint;
  timezone?: string;
  currency_code?: string;
  is_active?: boolean;
  created_by?: bigint;
}

/**
 * Contract for partial company updates.
 * `code` and `tax_id` are intentionally immutable.
 */
export interface UpdateCompanyInput extends Partial<Omit<CreateCompanyInput, "code" | "tax_id">> {}

/**
 * Repository layer for direct persistence operations over `companies`.
 */
class CompanyRepository {
  /**
   * Retrieves all active (not soft-deleted) companies ordered by id descending.
   */
  findAll() {
    return prisma.companies.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        code: true,
        legal_name: true,
        trade_name: true,
        tax_id: true,
        industry_type: true,
        email: true,
        phone: true,
        address_line: true,
        commune_id: true,
        timezone: true,
        currency_code: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        communes: {
          select: {
            name: true,
            cities: {
              select: {
                name: true,
                regions: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    });
  }

  /**
   * Finds a company by id excluding soft-deleted rows.
   */
  findById(id: bigint) {
    return prisma.companies.findFirst({
      where: { id, deleted_at: null },
      include: {
        communes: {
          include: {
            cities: {
              include: { regions: true }
            }
          }
        }
      }
    });
  }

  /**
   * Finds an active company by code.
   */
  findByCode(code: string) {
    return prisma.companies.findFirst({ where: { code, deleted_at: null } });
  }

  /**
   * Finds an active company by tax identifier.
   */
  findByTaxId(tax_id: string) {
    return prisma.companies.findFirst({ where: { tax_id, deleted_at: null } });
  }

  /**
   * Inserts a new company record.
   */
  create(data: CreateCompanyInput) {
    const now = new Date();
    return prisma.companies.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  /**
   * Updates a company record and refreshes the `updated_at` timestamp.
   */
  update(id: bigint, data: UpdateCompanyInput) {
    return prisma.companies.update({
      where: { id },
      data: { ...data, updated_at: new Date() }
    });
  }

  /**
   * Soft-deletes a company by setting `deleted_at` and deactivating it.
   */
  softDelete(id: bigint) {
    return prisma.companies.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false, updated_at: new Date() }
    });
  }
}

export const companyRepository = new CompanyRepository();
