import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { Prisma } from "@prisma/client";
import {
  digitalAssetRepository,
  type CreateDigitalAssetInput,
  type UpdateDigitalAssetInput
} from "./digital_asset.repository";

/**
 * Business layer for digital assets operations.
 */
class DigitalAssetService {
  /**
   * Lists active digital assets for company scope.
   */
  async list(companyId: bigint) {
    const rows = await digitalAssetRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one digital asset by id in company scope.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await digitalAssetRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Activo digital no encontrado", 404);
    }

    return this.serialize(row);
  }

  /**
   * Creates one digital asset after company-scope uniqueness checks.
   */
  async create(companyId: bigint, dto: CreateDigitalAssetDto) {
    const duplicatedStorage = await digitalAssetRepository.findByStorageKey(
      companyId,
      dto.storage_disk,
      dto.storage_key
    );
    if (duplicatedStorage) {
      throw new AppError("La combinación disco/clave ya existe para la empresa", 409);
    }

    if (dto.sha256_hash) {
      const duplicatedHash = await digitalAssetRepository.findBySha256(companyId, dto.sha256_hash);
      if (duplicatedHash) {
        throw new AppError("Ya existe un activo con el mismo hash para la empresa", 409);
      }
    }

    const payload: CreateDigitalAssetInput = {
      company_id: companyId,
      storage_disk: dto.storage_disk,
      storage_key: dto.storage_key,
      original_filename: dto.original_filename,
      public_url: dto.public_url,
      mime_type: dto.mime_type,
      extension: dto.extension,
      size_bytes: BigInt(dto.size_bytes),
      width_px: dto.width_px,
      height_px: dto.height_px,
      sha256_hash: dto.sha256_hash,
      metadata_json: dto.metadata_json,
      is_active: dto.is_active,
      created_by: dto.created_by
    };

    const created = await digitalAssetRepository.create(payload);
    return this.getById(companyId, created.id);
  }

  /**
   * Updates one digital asset in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateDigitalAssetDto) {
    await this.getById(companyId, id);

    if (dto.storage_disk !== undefined || dto.storage_key !== undefined) {
      const current = await digitalAssetRepository.findById(companyId, id);
      if (!current) {
        throw new AppError("Activo digital no encontrado", 404);
      }

      const nextStorageDisk = dto.storage_disk ?? current.storage_disk;
      const nextStorageKey = dto.storage_key ?? current.storage_key;
      const duplicatedStorage = await digitalAssetRepository.findByStorageKey(
        companyId,
        nextStorageDisk,
        nextStorageKey,
        id
      );
      if (duplicatedStorage) {
        throw new AppError("La combinación disco/clave ya existe para la empresa", 409);
      }
    }

    if (dto.sha256_hash) {
      const duplicatedHash = await digitalAssetRepository.findBySha256(companyId, dto.sha256_hash, id);
      if (duplicatedHash) {
        throw new AppError("Ya existe un activo con el mismo hash para la empresa", 409);
      }
    }

    const payload: UpdateDigitalAssetInput = {
      ...(dto.storage_disk !== undefined && { storage_disk: dto.storage_disk }),
      ...(dto.storage_key !== undefined && { storage_key: dto.storage_key }),
      ...(dto.original_filename !== undefined && { original_filename: dto.original_filename }),
      ...(dto.public_url !== undefined && { public_url: dto.public_url }),
      ...(dto.mime_type !== undefined && { mime_type: dto.mime_type }),
      ...(dto.extension !== undefined && { extension: dto.extension }),
      ...(dto.size_bytes !== undefined && { size_bytes: BigInt(dto.size_bytes) }),
      ...(dto.width_px !== undefined && { width_px: dto.width_px }),
      ...(dto.height_px !== undefined && { height_px: dto.height_px }),
      ...(dto.sha256_hash !== undefined && { sha256_hash: dto.sha256_hash }),
      ...(dto.metadata_json !== undefined && { metadata_json: dto.metadata_json }),
      ...(dto.is_active !== undefined && { is_active: dto.is_active })
    };

    await digitalAssetRepository.update(companyId, id, payload);
    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one digital asset in company scope.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await digitalAssetRepository.softDelete(companyId, id);
  }

  /**
   * Normalizes Prisma entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      storage_disk: row.storage_disk,
      storage_key: row.storage_key,
      original_filename: row.original_filename ?? null,
      public_url: row.public_url ?? null,
      mime_type: row.mime_type,
      extension: row.extension ?? null,
      size_bytes: row.size_bytes.toString(),
      width_px: row.width_px ?? null,
      height_px: row.height_px ?? null,
      sha256_hash: row.sha256_hash ?? null,
      metadata_json: row.metadata_json ?? null,
      is_active: row.is_active,
      product_images_count: row._count?.product_images ?? 0,
      dependencies_count: row._count?.product_images ?? 0,
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const digitalAssetService = new DigitalAssetService();

type CreateDigitalAssetDto = {
  storage_disk: string;
  storage_key: string;
  original_filename?: string;
  public_url?: string;
  mime_type: string;
  extension?: string;
  size_bytes: number;
  width_px?: number;
  height_px?: number;
  sha256_hash?: string;
  metadata_json?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  is_active: boolean;
  created_by?: bigint;
};

type UpdateDigitalAssetDto = {
  storage_disk?: string;
  storage_key?: string;
  original_filename?: string;
  public_url?: string;
  mime_type?: string;
  extension?: string;
  size_bytes?: number;
  width_px?: number;
  height_px?: number;
  sha256_hash?: string;
  metadata_json?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  is_active?: boolean;
};
