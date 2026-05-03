import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  inventoryMovementRepository,
  CreateInventoryMovementInput,
  UpdateInventoryMovementInput
} from "./inventory_movement.repository";
import type {
  CreateInventoryMovementDto,
  UpdateInventoryMovementDto
} from "./inventory_movement.schema";

class InventoryMovementService {
  async list(
    companyId: bigint,
    filters?: {
      movement_type_id?: number;
      warehouse_id?: number;
      product_variant_id?: number;
      date_from?: Date;
      date_to?: Date;
    }
  ) {
    const rows = await inventoryMovementRepository.findAll(companyId, {
      movement_type_id: filters?.movement_type_id ? BigInt(filters.movement_type_id) : undefined,
      warehouse_id: filters?.warehouse_id ? BigInt(filters.warehouse_id) : undefined,
      product_variant_id: filters?.product_variant_id ? BigInt(filters.product_variant_id) : undefined,
      date_from: filters?.date_from,
      date_to: filters?.date_to
    });

    return rows.map((row) => this.serialize(row));
  }

  async getById(companyId: bigint, id: bigint) {
    const row = await inventoryMovementRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Movimiento de inventario no encontrado", 404);
    }
    return this.serialize(row);
  }

  async create(companyId: bigint, dto: CreateInventoryMovementDto, createdBy?: bigint) {
    const movementTypeId = BigInt(dto.movement_type_id);
    const warehouseId = BigInt(dto.warehouse_id);
    const relatedWarehouseId = dto.related_warehouse_id ? BigInt(dto.related_warehouse_id) : null;
    const productVariantId = BigInt(dto.product_variant_id);

    const movementType = await this.requireMovementType(movementTypeId);
    await this.requireWarehouse(companyId, warehouseId);

    if (relatedWarehouseId) {
      await this.requireWarehouse(companyId, relatedWarehouseId);
    }

    await this.requireVariant(companyId, productVariantId);
    this.validateTransferScope(movementType.direction, warehouseId, relatedWarehouseId);

    const sourceDocumentType = dto.source_document_type?.trim() || null;
    const sourceDocumentId = dto.source_document_id ? BigInt(dto.source_document_id) : null;
    this.validateSourceScope(sourceDocumentType, sourceDocumentId);

    const input: CreateInventoryMovementInput = {
      company_id: companyId,
      movement_type_id: movementTypeId,
      warehouse_id: warehouseId,
      related_warehouse_id: relatedWarehouseId,
      product_variant_id: productVariantId,
      quantity: dto.quantity,
      unit_cost: dto.unit_cost ?? null,
      movement_date: dto.movement_date,
      reason: dto.reason?.trim() || null,
      source_document_type: sourceDocumentType,
      source_document_id: sourceDocumentId,
      created_by: createdBy ?? null
    };

    const created = await inventoryMovementRepository.create(input);
    return this.serialize(created);
  }

  async update(companyId: bigint, id: bigint, dto: UpdateInventoryMovementDto) {
    const current = await inventoryMovementRepository.findById(companyId, id);
    if (!current) {
      throw new AppError("Movimiento de inventario no encontrado", 404);
    }

    const nextMovementTypeId = dto.movement_type_id ? BigInt(dto.movement_type_id) : current.movement_type_id;
    const nextWarehouseId = dto.warehouse_id ? BigInt(dto.warehouse_id) : current.warehouse_id;

    const nextRelatedWarehouseId = Object.prototype.hasOwnProperty.call(dto, "related_warehouse_id")
      ? (dto.related_warehouse_id ? BigInt(dto.related_warehouse_id) : null)
      : (current.related_warehouse_id ?? null);

    const nextProductVariantId = dto.product_variant_id
      ? BigInt(dto.product_variant_id)
      : current.product_variant_id;

    const movementType = await this.requireMovementType(nextMovementTypeId);
    await this.requireWarehouse(companyId, nextWarehouseId);

    if (nextRelatedWarehouseId) {
      await this.requireWarehouse(companyId, nextRelatedWarehouseId);
    }

    await this.requireVariant(companyId, nextProductVariantId);
    this.validateTransferScope(movementType.direction, nextWarehouseId, nextRelatedWarehouseId);

    const nextSourceDocumentType = Object.prototype.hasOwnProperty.call(dto, "source_document_type")
      ? (dto.source_document_type?.trim() || null)
      : (current.source_document_type ?? null);

    const nextSourceDocumentId = Object.prototype.hasOwnProperty.call(dto, "source_document_id")
      ? (dto.source_document_id ? BigInt(dto.source_document_id) : null)
      : (current.source_document_id ?? null);

    this.validateSourceScope(nextSourceDocumentType, nextSourceDocumentId);

    const updateInput: UpdateInventoryMovementInput = {
      ...(dto.movement_type_id !== undefined ? { movement_type_id: nextMovementTypeId } : {}),
      ...(dto.warehouse_id !== undefined ? { warehouse_id: nextWarehouseId } : {}),
      ...(Object.prototype.hasOwnProperty.call(dto, "related_warehouse_id") ? { related_warehouse_id: nextRelatedWarehouseId } : {}),
      ...(dto.product_variant_id !== undefined ? { product_variant_id: nextProductVariantId } : {}),
      ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
      ...(Object.prototype.hasOwnProperty.call(dto, "unit_cost") ? { unit_cost: dto.unit_cost ?? null } : {}),
      ...(dto.movement_date !== undefined ? { movement_date: dto.movement_date } : {}),
      ...(Object.prototype.hasOwnProperty.call(dto, "reason") ? { reason: dto.reason?.trim() || null } : {}),
      ...(Object.prototype.hasOwnProperty.call(dto, "source_document_type") ? { source_document_type: nextSourceDocumentType } : {}),
      ...(Object.prototype.hasOwnProperty.call(dto, "source_document_id") ? { source_document_id: nextSourceDocumentId } : {})
    };

    const updated = await inventoryMovementRepository.update(companyId, id, updateInput);
    return this.serialize(updated);
  }

  async remove(companyId: bigint, id: bigint) {
    const row = await inventoryMovementRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Movimiento de inventario no encontrado", 404);
    }

    await inventoryMovementRepository.hardDelete(companyId, id);
  }

  private async requireMovementType(movementTypeId: bigint) {
    const movementType = await inventoryMovementRepository.findMovementTypeById(movementTypeId);
    if (!movementType) {
      throw new AppError("El tipo de movimiento seleccionado no existe", 404);
    }
    return movementType;
  }

  private async requireWarehouse(companyId: bigint, warehouseId: bigint) {
    const warehouse = await inventoryMovementRepository.findWarehouseById(companyId, warehouseId);
    if (!warehouse) {
      throw new AppError("La bodega seleccionada no existe o esta inactiva", 404);
    }
    return warehouse;
  }

  private async requireVariant(companyId: bigint, variantId: bigint) {
    const variant = await inventoryMovementRepository.findVariantById(companyId, variantId);
    if (!variant) {
      throw new AppError("La variante de producto seleccionada no existe o esta inactiva", 404);
    }
    return variant;
  }

  private validateTransferScope(direction: string, warehouseId: bigint, relatedWarehouseId: bigint | null) {
    if (direction === "TRANSFER") {
      if (!relatedWarehouseId) {
        throw new AppError("Los movimientos tipo TRANSFER requieren bodega relacionada", 400);
      }

      if (warehouseId === relatedWarehouseId) {
        throw new AppError("La bodega origen y destino no pueden ser la misma", 400);
      }
      return;
    }

    if (relatedWarehouseId) {
      throw new AppError("Solo los movimientos tipo TRANSFER permiten bodega relacionada", 400);
    }
  }

  private validateSourceScope(sourceDocumentType: string | null, sourceDocumentId: bigint | null) {
    if (sourceDocumentType && !sourceDocumentId) {
      throw new AppError("Debe indicar source_document_id cuando informa source_document_type", 400);
    }

    if (!sourceDocumentType && sourceDocumentId) {
      throw new AppError("Debe indicar source_document_type cuando informa source_document_id", 400);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      movement_type_id: row.movement_type_id.toString(),
      movement_type_code: row.inventory_movement_types?.code ?? null,
      movement_type_name: row.inventory_movement_types?.name ?? null,
      movement_direction: row.inventory_movement_types?.direction ?? null,
      warehouse_id: row.warehouse_id.toString(),
      warehouse_code: row.warehouses_inventory_movements_warehouse_idTowarehouses?.code ?? null,
      warehouse_name: row.warehouses_inventory_movements_warehouse_idTowarehouses?.name ?? null,
      related_warehouse_id: row.related_warehouse_id?.toString() ?? null,
      related_warehouse_code: row.warehouses_inventory_movements_related_warehouse_idTowarehouses?.code ?? null,
      related_warehouse_name: row.warehouses_inventory_movements_related_warehouse_idTowarehouses?.name ?? null,
      product_variant_id: row.product_variant_id.toString(),
      variant_code: row.product_variants?.variant_code ?? null,
      variant_name: row.product_variants?.name ?? null,
      variant_sku: row.product_variants?.sku ?? null,
      variant_barcode: row.product_variants?.barcode ?? null,
      product_id: row.product_variants?.products?.id?.toString() ?? null,
      product_name: row.product_variants?.products?.name ?? null,
      product_sku: row.product_variants?.products?.sku ?? null,
      quantity: Number(row.quantity),
      unit_cost: row.unit_cost !== null ? Number(row.unit_cost) : null,
      movement_date: toUtcIsoString(row.movement_date),
      reason: row.reason ?? null,
      source_document_type: row.source_document_type ?? null,
      source_document_id: row.source_document_id?.toString() ?? null,
      created_at: toUtcIsoString(row.created_at),
      created_by: row.created_by?.toString() ?? null,
      is_transfer: row.inventory_movement_types?.direction === "TRANSFER"
    };
  }
}

export const inventoryMovementService = new InventoryMovementService();
