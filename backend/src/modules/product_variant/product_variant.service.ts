import { AppError } from "../../common/errors/app-error";
import { Prisma } from "@prisma/client";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  productVariantRepository,
  CreateProductVariantInput,
  UpdateProductVariantInput
} from "./product_variant.repository";
import { CreateProductVariantDto, UpdateProductVariantDto } from "./product_variant.schema";

/**
 * Business layer for product variant operations.
 */
class ProductVariantService {
  /**
   * Lists active product variants for company scope.
   */
  async list(companyId: bigint) {
    const rows = await productVariantRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Lists active products for company scope.
   */
  async listProducts(companyId: bigint) {
    const rows = await productVariantRepository.findProducts(companyId);
    return rows.map((row) => ({
      id: row.id.toString(),
      sku: row.sku,
      name: row.name
    }));
  }

  /**
   * Returns one product variant by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await productVariantRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Variante de producto no encontrada", 404);
    }
    return this.serialize(row);
  }

  /**
   * Creates one product variant in company scope.
   */
  async create(companyId: bigint, dto: CreateProductVariantDto) {
    const productId = BigInt(dto.product_id);
    const product = await productVariantRepository.findProductById(companyId, productId);
    if (!product) {
      throw new AppError("El producto seleccionado no existe", 404);
    }

    const existingCode = await productVariantRepository.findByVariantCode(companyId, dto.variant_code);
    if (existingCode) {
      throw new AppError("El código de variante ya existe para la empresa", 409);
    }

    const sku = this.normalizeNullableText(dto.sku);
    if (sku) {
      const existingSku = await productVariantRepository.findBySku(companyId, sku);
      if (existingSku) {
        throw new AppError("El SKU ya existe para la empresa", 409);
      }
    }

    const barcode = this.normalizeNullableText(dto.barcode);
    if (barcode) {
      const existingBarcode = await productVariantRepository.findByBarcode(companyId, barcode);
      if (existingBarcode) {
        throw new AppError("El código de barras ya existe para la empresa", 409);
      }
    }

    const created = await productVariantRepository.create({
      company_id: companyId,
      product_id: productId,
      variant_code: dto.variant_code,
      name: dto.name,
      attributes_json: this.normalizeJsonField(dto.attributes_json),
      sku,
      barcode,
      cost_price: dto.cost_price ?? 0,
      sale_price: dto.sale_price ?? 0,
      is_active: dto.is_active ?? true
    });

    return this.serialize(created);
  }

  /**
   * Updates one product variant in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateProductVariantDto) {
    await this.getById(companyId, id);

    const sku = dto.sku !== undefined ? this.normalizeNullableText(dto.sku) : undefined;
    if (sku) {
      const existingSku = await productVariantRepository.findBySku(companyId, sku, id);
      if (existingSku) {
        throw new AppError("El SKU ya existe para la empresa", 409);
      }
    }

    const barcode = dto.barcode !== undefined ? this.normalizeNullableText(dto.barcode) : undefined;
    if (barcode) {
      const existingBarcode = await productVariantRepository.findByBarcode(companyId, barcode, id);
      if (existingBarcode) {
        throw new AppError("El código de barras ya existe para la empresa", 409);
      }
    }

    const updateData: UpdateProductVariantInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.attributes_json !== undefined && { attributes_json: this.normalizeJsonField(dto.attributes_json) }),
      ...(dto.sku !== undefined && { sku }),
      ...(dto.barcode !== undefined && { barcode }),
      ...(dto.cost_price !== undefined && { cost_price: dto.cost_price }),
      ...(dto.sale_price !== undefined && { sale_price: dto.sale_price }),
      ...(dto.is_active !== undefined && { is_active: dto.is_active })
    };

    await productVariantRepository.update(companyId, id, updateData);
    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one product variant.
   */
  async remove(companyId: bigint, id: bigint) {
    const row = await productVariantRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Variante de producto no encontrada", 404);
    }

    const dependenciesCount = this.getDependenciesCount(row);
    if (dependenciesCount > 0) {
      throw new AppError("No se puede eliminar: la variante tiene dependencias operativas", 409);
    }

    await productVariantRepository.softDelete(companyId, id);
  }

  private normalizeNullableText(value?: string | null) {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeJsonField(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return Prisma.JsonNull;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        throw new AppError("El campo atributos debe contener un JSON válido", 400);
      }
    }

    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getDependenciesCount(row: any): number {
    const relationCount = row._count ?? {};
    return Number(relationCount.document_details ?? 0)
      + Number(relationCount.inventory ?? 0)
      + Number(relationCount.inventory_movements ?? 0)
      + Number(relationCount.sale_details ?? 0);
  }

  /**
   * Serializes Prisma entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    const documentDetailsCount = Number(row._count?.document_details ?? 0);
    const inventoryCount = Number(row._count?.inventory ?? 0);
    const inventoryMovementsCount = Number(row._count?.inventory_movements ?? 0);
    const saleDetailsCount = Number(row._count?.sale_details ?? 0);

    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      product_id: row.product_id.toString(),
      product_sku: row.products?.sku ?? null,
      product_name: row.products?.name ?? null,
      variant_code: row.variant_code,
      name: row.name,
      attributes_json: row.attributes_json ?? null,
      sku: row.sku ?? null,
      barcode: row.barcode ?? null,
      cost_price: Number(row.cost_price),
      sale_price: Number(row.sale_price),
      is_active: row.is_active,
      document_details_count: documentDetailsCount,
      inventory_count: inventoryCount,
      inventory_movements_count: inventoryMovementsCount,
      sale_details_count: saleDetailsCount,
      dependencies_count: documentDetailsCount + inventoryCount + inventoryMovementsCount + saleDetailsCount,
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const productVariantService = new ProductVariantService();
