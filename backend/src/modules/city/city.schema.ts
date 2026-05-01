import { z } from "zod";

/**
 * Validation schema for creating a city.
 */
export const createCitySchema = z.object({
  region_id: z.coerce.number().positive(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120)
});

/**
 * Validation schema for updates.
 * `code` and `region_id` are intentionally immutable.
 */
export const updateCitySchema = z.object({
  name: z.string().min(1).max(120)
}).partial();

export type CreateCityDto = z.infer<typeof createCitySchema>;
export type UpdateCityDto = z.infer<typeof updateCitySchema>;
