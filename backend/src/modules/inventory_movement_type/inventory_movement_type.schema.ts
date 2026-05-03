import { z } from "zod";

const inventoryMovementTypeDirectionSchema = z.enum(["IN", "OUT", "TRANSFER"]);

export const createInventoryMovementTypeSchema = z.object({
  code: z.string().trim().min(1).max(30),
  name: z.string().trim().min(1).max(120),
  direction: inventoryMovementTypeDirectionSchema
});

export const updateInventoryMovementTypeSchema = createInventoryMovementTypeSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Debe enviar al menos un campo para actualizar"
);

export type CreateInventoryMovementTypeDto = z.infer<typeof createInventoryMovementTypeSchema>;
export type UpdateInventoryMovementTypeDto = z.infer<typeof updateInventoryMovementTypeSchema>;