import { z } from "zod";

/**
 * Validation schema for creating a commune.
 */
export const createCommuneSchema = z.object({
  city_id: z.coerce.number().positive(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  postal_code: z.string().max(20).optional().or(z.literal(""))
});

/**
 * Validation schema for updates.
 * `code` and `city_id` are intentionally immutable.
 */
export const updateCommuneSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  postal_code: z.string().max(20).optional().or(z.literal(""))
}).partial();

export type CreateCommuneDto = z.infer<typeof createCommuneSchema>;
export type UpdateCommuneDto = z.infer<typeof updateCommuneSchema>;
