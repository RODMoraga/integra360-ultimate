import { prisma } from "../../config/database";

export interface CreateInventoryInput {
  company_id: bigint;
  warehouse_id: bigint;
  product_variant_id: bigint;
  quantity_on_hand?: number | string;
  quantity_reserved?: number | string;
  min_stock?: number | string;
  max_stock?: number | string | null;
  reorder_point?: number | string | null;
}

export interface UpdateInventoryInput {
  quantity_on_hand?: number | string;
  quantity_reserved?: number | string;
  min_stock?: number | string;
  max_stock?: number | string | null;
  reorder_point?: number | string | null;
}

const inventoryInclude = {
  warehouses: {
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

class InventoryRepository {
  findAll(companyId: bigint, filters?: { warehouse_id?: bigint; low_stock?: boolean }) {
    return prisma.inventory.findMany({
      where: {
        company_id: companyId,
        ...(filters?.warehouse_id ? { warehouse_id: filters.warehouse_id } : {})
      },
      include: inventoryInclude,
      orderBy: [
        { warehouses: { name: "asc" } },
        { product_variants: { name: "asc" } }
      ]
    });
  }

  findById(companyId: bigint, id: bigint) {
    return prisma.inventory.findFirst({
      where: {
        id,
        company_id: companyId
      },
      include: inventoryInclude
    });
  }

  findByScope(companyId: bigint, warehouseId: bigint, productVariantId: bigint) {
    return prisma.inventory.findFirst({
      where: {
        company_id: companyId,
        warehouse_id: warehouseId,
        product_variant_id: productVariantId
      },
      include: inventoryInclude
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

  create(data: CreateInventoryInput) {
    return prisma.inventory.create({
      data: {
        company_id: data.company_id,
        warehouse_id: data.warehouse_id,
        product_variant_id: data.product_variant_id,
        quantity_on_hand: data.quantity_on_hand ?? 0,
        quantity_reserved: data.quantity_reserved ?? 0,
        min_stock: data.min_stock ?? 0,
        max_stock: data.max_stock ?? undefined,
        reorder_point: data.reorder_point ?? undefined
      },
      include: inventoryInclude
    });
  }

  update(companyId: bigint, id: bigint, data: UpdateInventoryInput) {
    return prisma.inventory.update({
      where: { id },
      data: {
        ...(data.quantity_on_hand !== undefined ? { quantity_on_hand: data.quantity_on_hand } : {}),
        ...(data.quantity_reserved !== undefined ? { quantity_reserved: data.quantity_reserved } : {}),
        ...(data.min_stock !== undefined ? { min_stock: data.min_stock } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "max_stock") ? { max_stock: data.max_stock } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "reorder_point") ? { reorder_point: data.reorder_point } : {}),
        updated_at: new Date()
      },
      include: inventoryInclude
    });
  }

  hardDelete(companyId: bigint, id: bigint) {
    return prisma.inventory.delete({
      where: { id }
    });
  }
}

export const inventoryRepository = new InventoryRepository();
