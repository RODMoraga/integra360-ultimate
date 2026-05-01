import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

const productImageInclude = {
  digital_assets: {
    select: {
      id: true,
      storage_key: true,
      original_filename: true,
      public_url: true,
      mime_type: true,
      extension: true,
      size_bytes: true,
      width_px: true,
      height_px: true,
      sha256_hash: true
    }
  },
  products: {
    select: {
      id: true,
      sku: true,
      name: true
    }
  }
} as const;

type DbClient = Prisma.TransactionClient | typeof prisma;

export interface CreateDigitalAssetInput {
  company_id: bigint;
  storage_disk?: string;
  storage_key: string;
  original_filename?: string | null;
  public_url?: string | null;
  mime_type: string;
  extension?: string | null;
  size_bytes: bigint;
  width_px?: number | null;
  height_px?: number | null;
  sha256_hash?: string | null;
  created_by?: bigint | null;
}

export interface CreateProductImageInput {
  company_id: bigint;
  product_id: bigint;
  asset_id: bigint;
  purpose: "PRIMARY" | "GALLERY" | "THUMBNAIL" | "DETAIL" | "PACKAGING";
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
  created_by?: bigint | null;
  primary_product_id?: bigint | null;
}

export interface UpdateProductImageInput {
  purpose?: "PRIMARY" | "GALLERY" | "THUMBNAIL" | "DETAIL" | "PACKAGING";
  alt_text?: string | null;
  sort_order?: number;
  is_primary?: boolean;
  is_active?: boolean;
  asset_id?: bigint;
  primary_product_id?: bigint | null;
}

/**
 * Repository layer for direct persistence operations over `product_images` and `digital_assets`.
 */
class ProductImageRepository {
  findAll(companyId: bigint, productId?: bigint) {
    return prisma.product_images.findMany({
      where: {
        company_id: companyId,
        deleted_at: null,
        ...(productId ? { product_id: productId } : {})
      },
      include: productImageInclude,
      orderBy: [{ product_id: "asc" }, { sort_order: "asc" }, { created_at: "desc" }]
    });
  }

  findById(companyId: bigint, id: bigint) {
    return prisma.product_images.findFirst({
      where: { company_id: companyId, id, deleted_at: null },
      include: productImageInclude
    });
  }

  findProductById(companyId: bigint, productId: bigint) {
    return prisma.products.findFirst({
      where: { id: productId, company_id: companyId, deleted_at: null },
      select: { id: true, name: true, sku: true }
    });
  }

  findAssetBySha256(companyId: bigint, sha256: string) {
    return prisma.digital_assets.findFirst({
      where: { company_id: companyId, sha256_hash: sha256, deleted_at: null, is_active: true }
    });
  }

  findSortOrderConflict(
    companyId: bigint,
    productId: bigint,
    sortOrder: number,
    excludeId?: bigint,
    db: DbClient = prisma
  ) {
    return db.product_images.findFirst({
      where: {
        company_id: companyId,
        product_id: productId,
        sort_order: sortOrder,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  async findNextSortOrder(companyId: bigint, productId: bigint, db: DbClient = prisma) {
    const maxRow = await db.product_images.aggregate({
      where: { company_id: companyId, product_id: productId, deleted_at: null },
      _max: { sort_order: true }
    });
    return (maxRow._max.sort_order ?? 0) + 1;
  }

  createDigitalAsset(data: CreateDigitalAssetInput, db: DbClient = prisma) {
    const now = new Date();
    return db.digital_assets.create({
      data: {
        storage_disk: "local",
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  createProductImage(data: CreateProductImageInput, db: DbClient = prisma) {
    const now = new Date();
    return db.product_images.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      },
      include: productImageInclude
    });
  }

  updateProductImage(id: bigint, data: UpdateProductImageInput, db: DbClient = prisma) {
    return db.product_images.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      },
      include: productImageInclude
    });
  }

  clearPrimaryForProduct(companyId: bigint, productId: bigint, excludeId?: bigint, db: DbClient = prisma) {
    return db.product_images.updateMany({
      where: {
        company_id: companyId,
        product_id: productId,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      data: {
        is_primary: false,
        primary_product_id: null,
        updated_at: new Date()
      }
    });
  }

  findPrimaryActiveByProduct(companyId: bigint, productId: bigint, db: DbClient = prisma) {
    return db.product_images.findFirst({
      where: {
        company_id: companyId,
        product_id: productId,
        deleted_at: null,
        is_active: true,
        is_primary: true
      },
      include: { digital_assets: { select: { public_url: true } } }
    });
  }

  findFirstActiveByProduct(companyId: bigint, productId: bigint, db: DbClient = prisma) {
    return db.product_images.findFirst({
      where: {
        company_id: companyId,
        product_id: productId,
        deleted_at: null,
        is_active: true
      },
      include: { digital_assets: { select: { public_url: true } } },
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }]
    });
  }

  countActiveByProduct(companyId: bigint, productId: bigint, db: DbClient = prisma) {
    return db.product_images.count({
      where: {
        company_id: companyId,
        product_id: productId,
        deleted_at: null,
        is_active: true
      }
    });
  }

  updateProductImageStats(productId: bigint, imageCount: number, thumbnailUrl: string | null, db: DbClient = prisma) {
    return db.products.update({
      where: { id: productId },
      data: {
        image_count: imageCount,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date()
      }
    });
  }

  findAssetById(companyId: bigint, assetId: bigint, db: DbClient = prisma) {
    return db.digital_assets.findFirst({
      where: { id: assetId, company_id: companyId, deleted_at: null }
    });
  }

  countAssetUsage(companyId: bigint, assetId: bigint, db: DbClient = prisma) {
    return db.product_images.count({
      where: {
        company_id: companyId,
        asset_id: assetId,
        deleted_at: null
      }
    });
  }

  softDeleteAsset(assetId: bigint, db: DbClient = prisma) {
    return db.digital_assets.update({
      where: { id: assetId },
      data: {
        deleted_at: new Date(),
        is_active: false,
        updated_at: new Date()
      }
    });
  }

  softDeleteProductImage(id: bigint, db: DbClient = prisma) {
    return db.product_images.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
        is_primary: false,
        primary_product_id: null,
        updated_at: new Date()
      }
    });
  }
}

export const productImageRepository = new ProductImageRepository();
