import { z } from "zod";

/**
 * Validation schema for creating a region.
 */
export const createRegionSchema = z.object({
  country_code: z.string().length(2).toUpperCase().default("CL"),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120)
});

/**
 * Validation schema for updates.
 * `code` and `country_code` are intentionally immutable.
 */
export const updateRegionSchema = z.object({
  name: z.string().min(1).max(120)
}).partial();

export type CreateRegionDto = z.infer<typeof createRegionSchema>;
export type UpdateRegionDto = z.infer<typeof updateRegionSchema>;
