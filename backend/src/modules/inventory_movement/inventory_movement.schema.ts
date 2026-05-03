import { z } from "zod";

const decimalPositiveField = z.coerce.number().gt(0).max(9999999999999.9999);
const decimalNullableField = z.coerce.number().min(0).max(9999999999999.9999).nullable().optional();

const sourceDocumentTypeField = z.string().trim().max(40).optional().or(z.literal(""));

export const createInventoryMovementSchema = z.object({
  movement_type_id: z.coerce.number().int().positive(),
  warehouse_id: z.coerce.number().int().positive(),
  related_warehouse_id: z.coerce.number().int().positive().nullable().optional(),
  product_variant_id: z.coerce.number().int().positive(),
  quantity: decimalPositiveField,
  unit_cost: decimalNullableField,
  movement_date: z.coerce.date().optional(),
  reason: z.string().trim().max(255).optional().or(z.literal("")),
  source_document_type: sourceDocumentTypeField,
  source_document_id: z.coerce.number().int().positive().nullable().optional()
});

export const updateInventoryMovementSchema = createInventoryMovementSchema.partial();

export type CreateInventoryMovementDto = z.infer<typeof createInventoryMovementSchema>;
export type UpdateInventoryMovementDto = z.infer<typeof updateInventoryMovementSchema>;
