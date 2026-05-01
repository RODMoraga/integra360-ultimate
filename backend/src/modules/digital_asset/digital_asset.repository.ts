import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

/**
 * Contract for creating one digital asset in persistence layer.
 */
export interface CreateDigitalAssetInput {
  company_id: bigint;
  storage_disk: string;
  storage_key: string;
  original_filename?: string;
  public_url?: string;
  mime_type: string;
  extension?: string;
  size_bytes: bigint;
  width_px?: number;
  height_px?: number;
  sha256_hash?: string;
  metadata_json?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  is_active?: boolean;
  created_by?: bigint;
}

/**
 * Contract for partial digital asset updates.
 */
export interface UpdateDigitalAssetInput {
  storage_disk?: string;
  storage_key?: string;
  original_filename?: string;
  public_url?: string;
  mime_type?: string;
  extension?: string;
  size_bytes?: bigint;
  width_px?: number;
  height_px?: number;
  sha256_hash?: string;
  metadata_json?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  is_active?: boolean;
}

/**
 * Repository layer for direct persistence operations over `digital_assets`.
 */
class DigitalAssetRepository {
  /**
   * Retrieves all active (not soft-deleted) digital assets by company.
   */
  findAll(companyId: bigint) {
    return prisma.digital_assets.findMany({
      where: {
        company_id: companyId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            product_images: true
          }
        }
      },
      orderBy: [{ created_at: "desc" }]
    });
  }

  /**
   * Finds one active digital asset by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.digital_assets.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            product_images: true
          }
        }
      }
    });
  }

  /**
   * Finds one active digital asset by storage location in company scope.
   */
  findByStorageKey(companyId: bigint, storageDisk: string, storageKey: string, excludeId?: bigint) {
    return prisma.digital_assets.findFirst({
      where: {
        company_id: companyId,
        storage_disk: storageDisk,
        storage_key: storageKey,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds one active digital asset by sha256 hash in company scope.
   */
  findBySha256(companyId: bigint, sha256Hash: string, excludeId?: bigint) {
    return prisma.digital_assets.findFirst({
      where: {
        company_id: companyId,
        sha256_hash: sha256Hash,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Persists one digital asset row.
   */
  create(data: CreateDigitalAssetInput) {
    const now = new Date();
    return prisma.digital_assets.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  /**
   * Updates one digital asset row in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateDigitalAssetInput) {
    return prisma.digital_assets.updateMany({
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
   * Soft-deletes one digital asset row.
   */
  softDelete(companyId: bigint, id: bigint) {
    return prisma.digital_assets.updateMany({
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

export const digitalAssetRepository = new DigitalAssetRepository();
