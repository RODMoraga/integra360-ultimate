import { z } from "zod";

/**
 * Validation schema for creating a unit of measure.
 */
export const createUnitOfMeasureSchema = z.object({
  code: z.string().min(1, { message: "El código es obligatorio" }).max(20),
  name: z.string().min(1, { message: "El nombre es obligatorio" }).max(80),
  symbol: z.string().min(1, { message: "El símbolo es obligatorio" }).max(20),
  unit_type: z.string().min(1, { message: "El tipo de unidad es obligatorio" }).max(40),
  is_base_unit: z.coerce.boolean().optional().default(false)
});

/**
 * Validation schema for partial updates.
 * `code` is intentionally immutable after creation.
 */
export const updateUnitOfMeasureSchema = createUnitOfMeasureSchema
  .omit({ code: true })
  .partial();

export type CreateUnitOfMeasureDto = z.infer<typeof createUnitOfMeasureSchema>;
export type UpdateUnitOfMeasureDto = z.infer<typeof updateUnitOfMeasureSchema>;
