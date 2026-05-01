import { prisma } from "../../config/database";

/**
 * Contract for creating a category row in the database.
 */
export interface CreateCategoryInput {
  company_id: bigint;
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Contract for partial category updates.
 */
export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `categories`.
 */
class CategoryRepository {
  /**
   * Retrieves active categories for one company.
   */
  findAll(companyId: bigint) {
    return prisma.categories.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Finds one active category by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.categories.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    });
  }

  /**
   * Finds an active category by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.categories.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Persists a new category.
   */
  create(data: CreateCategoryInput) {
    return prisma.categories.create({ data });
  }

  /**
   * Updates one category in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateCategoryInput) {
    return prisma.categories.updateMany({
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
   * Soft-deletes one category.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.categories.updateMany({
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

export const categoryRepository = new CategoryRepository();