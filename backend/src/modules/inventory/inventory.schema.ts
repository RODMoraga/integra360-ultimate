import { z } from "zod";

const decimalField = z.coerce.number().min(0).max(9999999999999.9999);
const nullableDecimal = z.coerce.number().min(0).max(9999999999999.9999).nullable().optional();

export const createInventorySchema = z.object({
  warehouse_id: z.coerce.number().int().positive(),
  product_variant_id: z.coerce.number().int().positive(),
  quantity_on_hand: decimalField.optional().default(0),
  quantity_reserved: decimalField.optional().default(0),
  min_stock: decimalField.optional().default(0),
  max_stock: nullableDecimal,
  reorder_point: nullableDecimal
});

export const updateInventorySchema = z.object({
  quantity_on_hand: decimalField.optional(),
  quantity_reserved: decimalField.optional(),
  min_stock: decimalField.optional(),
  max_stock: nullableDecimal,
  reorder_point: nullableDecimal
}).partial();

export type CreateInventoryDto = z.infer<typeof createInventorySchema>;
export type UpdateInventoryDto = z.infer<typeof updateInventorySchema>;
