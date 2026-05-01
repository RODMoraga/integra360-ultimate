import { z } from "zod";

/**
 * Validation schema for creating a warehouse.
 */
export const createWarehouseSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(140),
  address_line: z.string().max(220).optional().or(z.literal("")),
  commune_id: z.coerce.number().positive().optional(),
  is_main: z.coerce.boolean().optional().default(false),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable.
 */
export const updateWarehouseSchema = createWarehouseSchema
  .omit({ code: true })
  .partial();

export type CreateWarehouseDto = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseDto = z.infer<typeof updateWarehouseSchema>;
