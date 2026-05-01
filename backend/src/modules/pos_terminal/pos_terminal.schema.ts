import { z } from "zod";

/**
 * Validation schema for creating a POS terminal.
 */
export const createPosTerminalSchema = z.object({
  warehouse_id: z.coerce.number().int().positive(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  device_name: z.string().max(120).optional().or(z.literal("")),
  serial_number: z.string().max(120).optional().or(z.literal("")),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable.
 */
export const updatePosTerminalSchema = createPosTerminalSchema
  .omit({ code: true })
  .partial();

export type CreatePosTerminalDto = z.infer<typeof createPosTerminalSchema>;
export type UpdatePosTerminalDto = z.infer<typeof updatePosTerminalSchema>;
