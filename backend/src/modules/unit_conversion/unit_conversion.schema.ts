import { z } from "zod";

/**
 * Validation schema for creating a unit conversion.
 */
export const createUnitConversionSchema = z
  .object({
    from_unit_id: z.coerce.number().int().positive({ message: "La unidad origen es obligatoria" }),
    to_unit_id: z.coerce.number().int().positive({ message: "La unidad destino es obligatoria" }),
    factor: z.coerce.number().positive({ message: "El factor debe ser mayor que cero" })
  })
  .refine((value) => value.from_unit_id !== value.to_unit_id, {
    message: "La unidad origen y destino deben ser distintas",
    path: ["to_unit_id"]
  });

/**
 * Validation schema for partial updates.
 */
export const updateUnitConversionSchema = z
  .object({
    from_unit_id: z.coerce.number().int().positive().optional(),
    to_unit_id: z.coerce.number().int().positive().optional(),
    factor: z.coerce.number().positive().optional()
  })
  .refine(
    (value) => {
      if (value.from_unit_id === undefined || value.to_unit_id === undefined) {
        return true;
      }
      return value.from_unit_id !== value.to_unit_id;
    },
    {
      message: "La unidad origen y destino deben ser distintas",
      path: ["to_unit_id"]
    }
  );

export type CreateUnitConversionDto = z.infer<typeof createUnitConversionSchema>;
export type UpdateUnitConversionDto = z.infer<typeof updateUnitConversionSchema>;
