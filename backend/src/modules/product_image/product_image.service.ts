import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import sharp from "sharp";
import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { env } from "../../config/env";
import { prisma } from "../../config/database";
import {
  productImageRepository,
  CreateDigitalAssetInput,
  CreateProductImageInput,
  UpdateProductImageInput
} from "./product_image.repository";
import {
  CreateProductImageDto,
  UpdateProductImageDto
} from "./product_image.schema";

type ProcessedImage = {
  buffer: Buffer;
  extension: "jpg" | "png";
  mimeType: "image/jpeg" | "image/png";
  width: number;
  height: number;
  sha256: string;
};

/**
 * Business layer for product image operations.
 */
class ProductImageService {
  private readonly uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);

  async list(companyId: bigint, productId?: bigint) {
    if (productId) {
      const product = await productImageRepository.findProductById(companyId, productId);
      if (!product) throw new AppError("Producto no encontrado", 404);
    }

    const rows = await productImageRepository.findAll(companyId, productId);
    return rows.map((row) => this.serialize(row));
  }

  async getById(companyId: bigint, id: bigint) {
    const row = await productImageRepository.findById(companyId, id);
    if (!row) throw new AppError("Imagen de producto no encontrada", 404);
    return this.serialize(row);
  }

  async create(
    companyId: bigint,
    userId: bigint | null,
    dto: CreateProductImageDto,
    file: Express.Multer.File
  ) {
    const productId = BigInt(dto.product_id);
    const product = await productImageRepository.findProductById(companyId, productId);
    if (!product) throw new AppError("Producto no encontrado", 404);

    const processed = await this.processImage(file);
    const existingAsset = await productImageRepository.findAssetBySha256(companyId, processed.sha256);

    const row = await prisma.$transaction(async (tx) => {
      const sortOrder = dto.sort_order ?? await productImageRepository.findNextSortOrder(companyId, productId, tx);

      const conflict = await productImageRepository.findSortOrderConflict(companyId, productId, sortOrder, undefined, tx);
      if (conflict) {
        throw new AppError("El orden ya existe para este producto", 409);
      }

      let assetId: bigint;

      if (existingAsset) {
        assetId = existingAsset.id;
      } else {
        const filename = `${Date.now()}-${crypto.randomUUID()}.${processed.extension}`;
        const storageKey = `${companyId.toString()}/${filename}`;
        await this.writeImageFile(storageKey, processed.buffer);

        const assetInput: CreateDigitalAssetInput = {
          company_id: companyId,
          storage_key: storageKey,
          original_filename: file.originalname,
          public_url: this.buildPublicUrl(storageKey),
          mime_type: processed.mimeType,
          extension: processed.extension,
          size_bytes: BigInt(processed.buffer.length),
          width_px: processed.width,
          height_px: processed.height,
          sha256_hash: processed.sha256,
          created_by: userId
        };

        const asset = await productImageRepository.createDigitalAsset(assetInput, tx);
        assetId = asset.id;
      }

      const imageInput: CreateProductImageInput = {
        company_id: companyId,
        product_id: productId,
        asset_id: assetId,
        purpose: dto.purpose,
        alt_text: dto.alt_text || null,
        sort_order: sortOrder,
        is_primary: dto.is_primary,
        is_active: dto.is_active,
        created_by: userId,
        primary_product_id: dto.is_primary ? productId : null
      };

      const created = await productImageRepository.createProductImage(imageInput, tx);

      if (dto.is_primary) {
        await productImageRepository.clearPrimaryForProduct(companyId, productId, created.id, tx);
        await productImageRepository.updateProductImage(
          created.id,
          { is_primary: true, primary_product_id: productId },
          tx
        );
      }

      await this.syncProductImageStats(companyId, productId, tx);
      const fresh = await productImageRepository.findById(companyId, created.id);
      if (!fresh) throw new AppError("Imagen de producto no encontrada", 404);

      return fresh;
    });

    return this.serialize(row);
  }

  async update(
    companyId: bigint,
    id: bigint,
    dto: UpdateProductImageDto,
    file?: Express.Multer.File
  ) {
    const existing = await productImageRepository.findById(companyId, id);
    if (!existing) throw new AppError("Imagen de producto no encontrada", 404);

    let obsoleteStorageKey: string | null = null;

    const row = await prisma.$transaction(async (tx) => {
      if (dto.sort_order !== undefined && dto.sort_order !== existing.sort_order) {
        const conflict = await productImageRepository.findSortOrderConflict(
          companyId,
          existing.product_id,
          dto.sort_order,
          id,
          tx
        );
        if (conflict) throw new AppError("El orden ya existe para este producto", 409);
      }

      let nextAssetId: bigint | undefined;

      if (file) {
        const processed = await this.processImage(file);
        const reusableAsset = await productImageRepository.findAssetBySha256(companyId, processed.sha256);

        if (reusableAsset) {
          nextAssetId = reusableAsset.id;
        } else {
          const filename = `${Date.now()}-${crypto.randomUUID()}.${processed.extension}`;
          const storageKey = `${companyId.toString()}/${filename}`;
          await this.writeImageFile(storageKey, processed.buffer);

          const createdAsset = await productImageRepository.createDigitalAsset(
            {
              company_id: companyId,
              storage_key: storageKey,
              original_filename: file.originalname,
              public_url: this.buildPublicUrl(storageKey),
              mime_type: processed.mimeType,
              extension: processed.extension,
              size_bytes: BigInt(processed.buffer.length),
              width_px: processed.width,
              height_px: processed.height,
              sha256_hash: processed.sha256,
              created_by: existing.created_by ?? null
            },
            tx
          );
          nextAssetId = createdAsset.id;
        }
      }

      const updateData: UpdateProductImageInput = {
        ...(dto.purpose !== undefined && { purpose: dto.purpose }),
        ...(dto.alt_text !== undefined && { alt_text: dto.alt_text || null }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        ...(dto.is_primary !== undefined && { is_primary: dto.is_primary }),
        ...(nextAssetId !== undefined && { asset_id: nextAssetId }),
        ...(dto.is_primary === true && { primary_product_id: existing.product_id }),
        ...(dto.is_primary === false && { primary_product_id: null })
      };

      await productImageRepository.updateProductImage(id, updateData, tx);

      if (dto.is_primary === true) {
        await productImageRepository.clearPrimaryForProduct(companyId, existing.product_id, id, tx);
        await productImageRepository.updateProductImage(
          id,
          { is_primary: true, primary_product_id: existing.product_id },
          tx
        );
      }

      if (nextAssetId !== undefined && nextAssetId !== existing.asset_id) {
        const oldUsageCount = await productImageRepository.countAssetUsage(companyId, existing.asset_id, tx);
        if (oldUsageCount === 0) {
          const oldAsset = await productImageRepository.findAssetById(companyId, existing.asset_id, tx);
          if (oldAsset) {
            obsoleteStorageKey = oldAsset.storage_key;
            await productImageRepository.softDeleteAsset(existing.asset_id, tx);
          }
        }
      }

      await this.ensurePrimaryAssignment(companyId, existing.product_id, tx);
      await this.syncProductImageStats(companyId, existing.product_id, tx);

      const fresh = await productImageRepository.findById(companyId, id);
      if (!fresh) throw new AppError("Imagen de producto no encontrada", 404);
      return fresh;
    });

    if (obsoleteStorageKey) {
      await this.tryDeleteFile(obsoleteStorageKey);
    }

    return this.serialize(row);
  }

  async remove(companyId: bigint, id: bigint) {
    const existing = await productImageRepository.findById(companyId, id);
    if (!existing) throw new AppError("Imagen de producto no encontrada", 404);

    let obsoleteStorageKey: string | null = null;

    await prisma.$transaction(async (tx) => {
      await productImageRepository.softDeleteProductImage(id, tx);

      const usage = await productImageRepository.countAssetUsage(companyId, existing.asset_id, tx);
      if (usage === 0) {
        const oldAsset = await productImageRepository.findAssetById(companyId, existing.asset_id, tx);
        if (oldAsset) {
          obsoleteStorageKey = oldAsset.storage_key;
          await productImageRepository.softDeleteAsset(existing.asset_id, tx);
        }
      }

      await this.ensurePrimaryAssignment(companyId, existing.product_id, tx);
      await this.syncProductImageStats(companyId, existing.product_id, tx);
    });

    if (obsoleteStorageKey) {
      await this.tryDeleteFile(obsoleteStorageKey);
    }
  }

  private async syncProductImageStats(
    companyId: bigint,
    productId: bigint,
    tx: Prisma.TransactionClient
  ) {
    const imageCount = await productImageRepository.countActiveByProduct(companyId, productId, tx);

    const primary = await productImageRepository.findPrimaryActiveByProduct(companyId, productId, tx);
    const fallback = primary ?? await productImageRepository.findFirstActiveByProduct(companyId, productId, tx);

    await productImageRepository.updateProductImageStats(
      productId,
      imageCount,
      fallback?.digital_assets?.public_url ?? null,
      tx
    );
  }

  private async ensurePrimaryAssignment(
    companyId: bigint,
    productId: bigint,
    tx: Prisma.TransactionClient
  ) {
    const hasPrimary = await productImageRepository.findPrimaryActiveByProduct(companyId, productId, tx);
    if (hasPrimary) {
      return;
    }

    const candidate = await productImageRepository.findFirstActiveByProduct(companyId, productId, tx);
    if (!candidate) {
      return;
    }

    await productImageRepository.clearPrimaryForProduct(companyId, productId, candidate.id, tx);
    await productImageRepository.updateProductImage(
      candidate.id,
      { is_primary: true, primary_product_id: productId },
      tx
    );
  }

  private async processImage(file: Express.Multer.File): Promise<ProcessedImage> {
    const isPng = file.mimetype === "image/png";
    const extension: "jpg" | "png" = isPng ? "png" : "jpg";
    const mimeType: "image/jpeg" | "image/png" = isPng ? "image/png" : "image/jpeg";

    let pipeline = sharp(file.buffer)
      .rotate()
      .resize(200, 200, {
        fit: "cover",
        position: "centre"
      });

    pipeline = isPng
      ? pipeline.png({ compressionLevel: 9 })
      : pipeline.jpeg({ quality: 92, mozjpeg: true });

    const outputBuffer = await pipeline.toBuffer();
    const digest = crypto.createHash("sha256").update(outputBuffer).digest("hex");

    return {
      buffer: outputBuffer,
      extension,
      mimeType,
      width: 200,
      height: 200,
      sha256: digest
    };
  }

  private async writeImageFile(storageKey: string, content: Buffer) {
    const destination = path.join(this.uploadRoot, storageKey);
    const destinationDir = path.dirname(destination);

    await fs.mkdir(destinationDir, { recursive: true });
    await fs.writeFile(destination, content);
  }

  private async tryDeleteFile(storageKey: string) {
    const targetPath = path.join(this.uploadRoot, storageKey);
    try {
      await fs.unlink(targetPath);
    } catch {
      // Ignore IO cleanup failures to avoid breaking successful DB transactions.
    }
  }

  private buildPublicUrl(storageKey: string) {
    const normalized = storageKey.replace(/\\/g, "/");
    return `/upload/${normalized}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      product_id: row.product_id.toString(),
      product_sku: row.products?.sku ?? null,
      product_name: row.products?.name ?? null,
      asset_id: row.asset_id.toString(),
      image_url: row.digital_assets?.public_url ?? null,
      storage_key: row.digital_assets?.storage_key ?? null,
      original_filename: row.digital_assets?.original_filename ?? null,
      mime_type: row.digital_assets?.mime_type ?? null,
      extension: row.digital_assets?.extension ?? null,
      size_bytes: row.digital_assets?.size_bytes?.toString?.() ?? null,
      width_px: row.digital_assets?.width_px ?? null,
      height_px: row.digital_assets?.height_px ?? null,
      purpose: row.purpose,
      alt_text: row.alt_text ?? null,
      sort_order: row.sort_order,
      is_primary: row.is_primary,
      is_active: row.is_active,
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const productImageService = new ProductImageService();
