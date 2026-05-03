import { prisma } from "../../config/database";

export interface CreateInventoryMovementInput {
  company_id: bigint;
  movement_type_id: bigint;
  warehouse_id: bigint;
  related_warehouse_id?: bigint | null;
  product_variant_id: bigint;
  quantity: number | string;
  unit_cost?: number | string | null;
  movement_date?: Date;
  reason?: string | null;
  source_document_type?: string | null;
  source_document_id?: bigint | null;
  created_by?: bigint | null;
}

export interface UpdateInventoryMovementInput {
  movement_type_id?: bigint;
  warehouse_id?: bigint;
  related_warehouse_id?: bigint | null;
  product_variant_id?: bigint;
  quantity?: number | string;
  unit_cost?: number | string | null;
  movement_date?: Date;
  reason?: string | null;
  source_document_type?: string | null;
  source_document_id?: bigint | null;
}

const inventoryMovementInclude = {
  inventory_movement_types: {
    select: {
      id: true,
      code: true,
      name: true,
      direction: true
    }
  },
  warehouses_inventory_movements_warehouse_idTowarehouses: {
    select: {
      id: true,
      code: true,
      name: true,
      is_active: true
    }
  },
  warehouses_inventory_movements_related_warehouse_idTowarehouses: {
    select: {
      id: true,
      code: true,
      name: true,
      is_active: true
    }
  },
  product_variants: {
    select: {
      id: true,
      variant_code: true,
      name: true,
      sku: true,
      barcode: true,
      is_active: true,
      products: {
        select: {
          id: true,
          sku: true,
          name: true
        }
      }
    }
  }
} as const;

class InventoryMovementRepository {
  findAll(
    companyId: bigint,
    filters?: {
      movement_type_id?: bigint;
      warehouse_id?: bigint;
      product_variant_id?: bigint;
      date_from?: Date;
      date_to?: Date;
    }
  ) {
    return prisma.inventory_movements.findMany({
      where: {
        company_id: companyId,
        ...(filters?.movement_type_id ? { movement_type_id: filters.movement_type_id } : {}),
        ...(filters?.warehouse_id ? { warehouse_id: filters.warehouse_id } : {}),
        ...(filters?.product_variant_id ? { product_variant_id: filters.product_variant_id } : {}),
        ...(filters?.date_from || filters?.date_to
          ? {
            movement_date: {
              ...(filters.date_from ? { gte: filters.date_from } : {}),
              ...(filters.date_to ? { lte: filters.date_to } : {})
            }
          }
          : {})
      },
      include: inventoryMovementInclude,
      orderBy: [{ movement_date: "desc" }, { id: "desc" }]
    });
  }

  findById(companyId: bigint, id: bigint) {
    return prisma.inventory_movements.findFirst({
      where: {
        id,
        company_id: companyId
      },
      include: inventoryMovementInclude
    });
  }

  findMovementTypeById(id: bigint) {
    return prisma.inventory_movement_types.findUnique({
      where: { id },
      select: { id: true, code: true, name: true, direction: true }
    });
  }

  findWarehouseById(companyId: bigint, warehouseId: bigint) {
    return prisma.warehouses.findFirst({
      where: {
        id: warehouseId,
        company_id: companyId,
        deleted_at: null,
        is_active: true
      },
      select: { id: true, code: true, name: true }
    });
  }

  findVariantById(companyId: bigint, variantId: bigint) {
    return prisma.product_variants.findFirst({
      where: {
        id: variantId,
        company_id: companyId,
        deleted_at: null,
        is_active: true
      },
      select: { id: true, variant_code: true, name: true, sku: true }
    });
  }

  create(data: CreateInventoryMovementInput) {
    return prisma.inventory_movements.create({
      data,
      include: inventoryMovementInclude
    });
  }

  update(companyId: bigint, id: bigint, data: UpdateInventoryMovementInput) {
    return prisma.inventory_movements.update({
      where: { id },
      data,
      include: inventoryMovementInclude
    });
  }

  hardDelete(companyId: bigint, id: bigint) {
    return prisma.inventory_movements.delete({
      where: { id }
    });
  }
}

export const inventoryMovementRepository = new InventoryMovementRepository();
