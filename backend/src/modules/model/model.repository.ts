import { prisma } from "../../config/database";

/**
 * Contract for creating a model row in the database.
 */
export interface CreateModelInput {
  company_id: bigint;
  brand_id: bigint;
  code: string;
  name: string;
}

/**
 * Contract for partial model updates.
 */
export interface UpdateModelInput {
  brand_id?: bigint;
  name?: string;
}

/**
 * Repository layer for direct persistence operations over `models`.
 */
class ModelRepository {
  /**
   * Retrieves active models for one company.
   */
  findAll(companyId: bigint) {
    return prisma.models.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        brands: {
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
   * Finds one active model by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.models.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        brands: {
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
   * Finds an active model by company and code.
   */
  findByCode(companyId: bigint, code: string, excludeId?: bigint) {
    return prisma.models.findFirst({
      where: {
        company_id: companyId,
        code,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Checks if a brand exists in company scope.
   */
  findBrandById(companyId: bigint, id: bigint) {
    return prisma.brands.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      }
    });
  }

  /**
   * Lists active brands for one company to populate selectors.
   */
  findBrands(companyId: bigint) {
    return prisma.brands.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      select: {
        id: true,
        code: true,
        name: true
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Persists a new model.
   */
  create(data: CreateModelInput) {
    return prisma.models.create({ data });
  }

  /**
   * Updates one model in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateModelInput) {
    return prisma.models.updateMany({
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
   * Soft-deletes one model.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.models.updateMany({
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

export const modelRepository = new ModelRepository();