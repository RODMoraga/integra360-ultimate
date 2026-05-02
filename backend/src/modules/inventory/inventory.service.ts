import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  inventoryRepository,
  CreateInventoryInput,
  UpdateInventoryInput
} from "./inventory.repository";
import type { CreateInventoryDto, UpdateInventoryDto } from "./inventory.schema";

class InventoryService {
  async list(companyId: bigint, filters?: { warehouse_id?: number; low_stock?: boolean }) {
    const warehouseId = filters?.warehouse_id ? BigInt(filters.warehouse_id) : undefined;

    let rows = await inventoryRepository.findAll(companyId, {
      warehouse_id: warehouseId
    });

    if (filters?.low_stock) {
      rows = rows.filter((row) => {
        const onHand = Number(row.quantity_on_hand);
        const reorder = row.reorder_point !== null ? Number(row.reorder_point) : null;
        return reorder !== null && onHand <= reorder;
      });
    }

    return rows.map((row) => this.serialize(row));
  }

  async getById(companyId: bigint, id: bigint) {
    const row = await inventoryRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Registro de inventario no encontrado", 404);
    }
    return this.serialize(row);
  }

  async create(companyId: bigint, dto: CreateInventoryDto) {
    const warehouseId = BigInt(dto.warehouse_id);
    const variantId = BigInt(dto.product_variant_id);

    const warehouse = await inventoryRepository.findWarehouseById(companyId, warehouseId);
    if (!warehouse) {
      throw new AppError("La bodega seleccionada no existe o está inactiva", 404);
    }

    const variant = await inventoryRepository.findVariantById(companyId, variantId);
    if (!variant) {
      throw new AppError("La variante de producto seleccionada no existe o está inactiva", 404);
    }

    const existing = await inventoryRepository.findByScope(companyId, warehouseId, variantId);
    if (existing) {
      throw new AppError(
        "Ya existe un registro de inventario para esta combinación de bodega y variante",
        409
      );
    }

    const createInput: CreateInventoryInput = {
      company_id: companyId,
      warehouse_id: warehouseId,
      product_variant_id: variantId,
      quantity_on_hand: dto.quantity_on_hand,
      quantity_reserved: dto.quantity_reserved,
      min_stock: dto.min_stock,
      max_stock: dto.max_stock ?? null,
      reorder_point: dto.reorder_point ?? null
    };

    const created = await inventoryRepository.create(createInput);
    return this.serialize(created);
  }

  async update(companyId: bigint, id: bigint, dto: UpdateInventoryDto) {
    await this.getById(companyId, id);

    const updateInput: UpdateInventoryInput = {};

    if (dto.quantity_on_hand !== undefined) updateInput.quantity_on_hand = dto.quantity_on_hand;
    if (dto.quantity_reserved !== undefined) updateInput.quantity_reserved = dto.quantity_reserved;
    if (dto.min_stock !== undefined) updateInput.min_stock = dto.min_stock;
    if (Object.prototype.hasOwnProperty.call(dto, "max_stock")) updateInput.max_stock = dto.max_stock ?? null;
    if (Object.prototype.hasOwnProperty.call(dto, "reorder_point")) updateInput.reorder_point = dto.reorder_point ?? null;

    const updated = await inventoryRepository.update(companyId, id, updateInput);
    return this.serialize(updated);
  }

  async remove(companyId: bigint, id: bigint) {
    const row = await inventoryRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Registro de inventario no encontrado", 404);
    }
    await inventoryRepository.hardDelete(companyId, id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    const onHand = Number(row.quantity_on_hand ?? 0);
    const reserved = Number(row.quantity_reserved ?? 0);
    const available = row.quantity_available !== null
      ? Number(row.quantity_available)
      : Math.max(0, onHand - reserved);
    const reorderPoint = row.reorder_point !== null ? Number(row.reorder_point) : null;
    const minStock = Number(row.min_stock ?? 0);
    const isLowStock = reorderPoint !== null ? onHand <= reorderPoint : onHand <= minStock;

    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      warehouse_id: row.warehouse_id.toString(),
      warehouse_code: row.warehouses?.code ?? null,
      warehouse_name: row.warehouses?.name ?? null,
      warehouse_active: row.warehouses?.is_active ?? null,
      product_variant_id: row.product_variant_id.toString(),
      variant_code: row.product_variants?.variant_code ?? null,
      variant_name: row.product_variants?.name ?? null,
      variant_sku: row.product_variants?.sku ?? null,
      variant_barcode: row.product_variants?.barcode ?? null,
      variant_active: row.product_variants?.is_active ?? null,
      product_id: row.product_variants?.products?.id?.toString() ?? null,
      product_name: row.product_variants?.products?.name ?? null,
      product_sku: row.product_variants?.products?.sku ?? null,
      quantity_on_hand: onHand,
      quantity_reserved: reserved,
      quantity_available: available,
      min_stock: minStock,
      max_stock: row.max_stock !== null ? Number(row.max_stock) : null,
      reorder_point: reorderPoint,
      is_low_stock: isLowStock,
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const inventoryService = new InventoryService();
