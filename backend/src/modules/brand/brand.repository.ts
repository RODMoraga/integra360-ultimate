import { prisma } from "../../config/database";

/**
 * Contract for creating a brand row in the database.
 */
export interface CreateBrandInput {
  company_id: bigint;
  code: string;
  name: string;
}

/**
 * Contract for partial brand updates.
 */
export interface UpdateBrandInput {
  name?: string;
}

/**
 * Repository layer for direct persistence operations over `brands`.
 */
class BrandRepository {
  /**
   * Retrieves active brands for one company.
   */
  findAll(companyId: bigint) {
    return prisma.brands.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            models: true,
            products: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Finds one active brand by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.brands.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            models: true,
            products: true
          }
        }
      }
    });
  }

  /**
   * Finds an active brand by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.brands.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Persists a new brand.
   */
  create(data: CreateBrandInput) {
    return prisma.brands.create({ data });
  }

  /**
   * Updates one brand in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateBrandInput) {
    return prisma.brands.updateMany({
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
   * Soft-deletes one brand.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.brands.updateMany({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }
}

export const brandRepository = new BrandRepository();
