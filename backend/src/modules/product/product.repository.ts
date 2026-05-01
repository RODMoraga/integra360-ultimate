import { prisma } from "../../config/database";

/**
 * Contract for creating a product row in the database.
 */
export interface CreateProductInput {
  company_id: bigint;
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  category_id?: bigint | null;
  subcategory_id?: bigint | null;
  brand_id?: bigint | null;
  model_id?: bigint | null;
  base_uom_id: bigint;
  tax_rate?: number;
  cost_price?: number;
  sale_price?: number;
  min_price?: number | null;
  is_featured?: boolean;
  track_inventory?: boolean;
  min_stock?: number;
  is_service?: boolean;
  is_active?: boolean;
}

/**
 * Contract for partial product updates.
 */
export type UpdateProductInput = Partial<Omit<CreateProductInput, "company_id" | "sku">>;

/**
 * Shared include for product relation data.
 */
const productInclude = {
  categories: { select: { id: true, code: true, name: true } },
  subcategories: { select: { id: true, code: true, name: true } },
  brands: { select: { id: true, code: true, name: true } },
  models: { select: { id: true, code: true, name: true } },
  units_of_measure: { select: { id: true, code: true, name: true, symbol: true } }
} as const;

/**
 * Repository layer for direct persistence operations over `products`.
 */
class ProductRepository {
  /**
   * Retrieves active products for one company.
   */
  findAll(companyId: bigint) {
    return prisma.products.findMany({
      where: { company_id: companyId, deleted_at: null },
      include: productInclude,
      orderBy: { name: "asc" }
    });
  }

  /**
   * Finds one active product by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.products.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      include: productInclude
    });
  }

  /**
   * Finds an active product by company and SKU.
   */
  findBySku(companyId: bigint, sku: string, excludeId?: bigint) {
    return prisma.products.findFirst({
      where: {
        company_id: companyId,
        sku,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds an active product by company and barcode.
   */
  findByBarcode(companyId: bigint, barcode: string, excludeId?: bigint) {
    return prisma.products.findFirst({
      where: {
        company_id: companyId,
        barcode,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Lists active units of measure for one company.
   */
  findUnits(companyId: bigint) {
    return prisma.units_of_measure.findMany({
      where: { company_id: companyId, deleted_at: null },
      select: { id: true, code: true, name: true, symbol: true },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Verifies a UOM exists in company scope.
   */
  findUomById(companyId: bigint, id: bigint) {
    return prisma.units_of_measure.findFirst({
      where: { id, company_id: companyId, deleted_at: null }
    });
  }

  /**
   * Persists a new product.
   */
  create(data: CreateProductInput) {
    return prisma.products.create({ data });
  }

  /**
   * Updates one product in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateProductInput) {
    return prisma.products.updateMany({
      where: { id, company_id: companyId, deleted_at: null },
      data: { ...data, updated_at: new Date() }
    });
  }

  /**
   * Soft-deletes one product.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.products.updateMany({
      where: { id, company_id: companyId, deleted_at: null },
      data: { deleted_at: new Date(), updated_at: new Date() }
    });
  }
}

export const productRepository = new ProductRepository();
