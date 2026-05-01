import { prisma } from "../../config/database";

/**
 * Contract for creating a subcategory row in the database.
 */
export interface CreateSubcategoryInput {
  company_id: bigint;
  category_id: bigint;
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Contract for partial subcategory updates.
 */
export interface UpdateSubcategoryInput {
  category_id?: bigint;
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `subcategories`.
 */
class SubcategoryRepository {
  /**
   * Retrieves active subcategories for one company.
   */
  findAll(companyId: bigint) {
    return prisma.subcategories.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        categories: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Finds one active subcategory by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.subcategories.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        categories: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  }

  /**
   * Finds an active subcategory by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.subcategories.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Checks if a category exists in company scope.
   */
  findCategoryById(companyId: bigint, id: bigint) {
    return prisma.categories.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      }
    });
  }

  /**
   * Persists a new subcategory.
   */
  create(data: CreateSubcategoryInput) {
    return prisma.subcategories.create({ data });
  }

  /**
   * Updates one subcategory in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateSubcategoryInput) {
    return prisma.subcategories.updateMany({
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
   * Soft-deletes one subcategory.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.subcategories.updateMany({
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

export const subcategoryRepository = new SubcategoryRepository();