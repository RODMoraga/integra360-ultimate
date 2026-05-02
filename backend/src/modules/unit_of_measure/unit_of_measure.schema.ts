import { z } from "zod";

const baseUnitBoolean = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "on", "yes", "si", "sí"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "off", "no", ""].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

/**
 * Validation schema for creating a unit of measure.
 */
export const createUnitOfMeasureSchema = z.object({
  code: z.string().min(1, { message: "El código es obligatorio" }).max(20),
  name: z.string().min(1, { message: "El nombre es obligatorio" }).max(80),
  symbol: z.string().min(1, { message: "El símbolo es obligatorio" }).max(20),
  unit_type: z.string().min(1, { message: "El tipo de unidad es obligatorio" }).max(40),
  is_base_unit: baseUnitBoolean.optional().default(false)
});

/**
 * Validation schema for partial updates.
 * `code` is intentionally immutable after creation.
 */
export const updateUnitOfMeasureSchema = createUnitOfMeasureSchema
  .omit({ code: true })
  .extend({
    is_base_unit: baseUnitBoolean.optional()
  })
  .partial();

export type CreateUnitOfMeasureDto = z.infer<typeof createUnitOfMeasureSchema>;
export type UpdateUnitOfMeasureDto = z.infer<typeof updateUnitOfMeasureSchema>;
