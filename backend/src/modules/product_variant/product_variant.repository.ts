import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

/**
 * Contract for creating a product variant row in the database.
 */
export interface CreateProductVariantInput {
  company_id: bigint;
  product_id: bigint;
  variant_code: string;
  name: string;
  attributes_json?: Prisma.InputJsonValue | typeof Prisma.JsonNull;
  sku?: string | null;
  barcode?: string | null;
  cost_price?: number;
  sale_price?: number;
  is_active?: boolean;
}

/**
 * Contract for partial product variant updates.
 */
export type UpdateProductVariantInput = Partial<
  Omit<CreateProductVariantInput, "company_id" | "product_id" | "variant_code">
>;

const productVariantInclude = {
  products: {
    select: {
      id: true,
      sku: true,
      name: true
    }
  },
  _count: {
    select: {
      document_details: true,
      inventory: true,
      inventory_movements: true,
      sale_details: true
    }
  }
} as const;

/**
 * Repository layer for direct persistence operations over `product_variants`.
 */
class ProductVariantRepository {
  /**
   * Retrieves active product variants for one company.
   */
  findAll(companyId: bigint) {
    return prisma.product_variants.findMany({
      where: { company_id: companyId, deleted_at: null },
      include: productVariantInclude,
      orderBy: [{ created_at: "desc" }]
    });
  }

  /**
   * Finds one active product variant by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.product_variants.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      include: productVariantInclude
    });
  }

  /**
   * Finds an active product variant by company and variant code.
   */
  findByVariantCode(companyId: bigint, variantCode: string, excludeId?: bigint) {
    return prisma.product_variants.findFirst({
      where: {
        company_id: companyId,
        variant_code: variantCode,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds an active product variant by company and SKU.
   */
  findBySku(companyId: bigint, sku: string, excludeId?: bigint) {
    return prisma.product_variants.findFirst({
      where: {
        company_id: companyId,
        sku,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds an active product variant by company and barcode.
   */
  findByBarcode(companyId: bigint, barcode: string, excludeId?: bigint) {
    return prisma.product_variants.findFirst({
      where: {
        company_id: companyId,
        barcode,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds one active product by id in company scope.
   */
  findProductById(companyId: bigint, productId: bigint) {
    return prisma.products.findFirst({
      where: { id: productId, company_id: companyId, deleted_at: null },
      select: { id: true, sku: true, name: true }
    });
  }

  /**
   * Lists active products for one company (variant form options).
   */
  findProducts(companyId: bigint) {
    return prisma.products.findMany({
      where: { company_id: companyId, deleted_at: null, is_active: true },
      select: {
        id: true,
        sku: true,
        name: true
      },
      orderBy: { name: "asc" }
    });
  }

  /**
   * Persists a new product variant.
   */
  create(data: CreateProductVariantInput) {
    const now = new Date();
    return prisma.product_variants.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      },
      include: productVariantInclude
    });
  }

  /**
   * Updates one product variant in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateProductVariantInput) {
    return prisma.product_variants.updateMany({
      where: { id, company_id: companyId, deleted_at: null },
      data: { ...data, updated_at: new Date() }
    });
  }

  /**
   * Soft-deletes one product variant.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.product_variants.updateMany({
      where: { id, company_id: companyId, deleted_at: null },
      data: { deleted_at: new Date(), is_active: false, updated_at: new Date() }
    });
  }
}

export const productVariantRepository = new ProductVariantRepository();
