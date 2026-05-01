import { z } from "zod";

/**
 * Validation schema for creating a brand.
 */
export const createBrandSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable after creation.
 */
export const updateBrandSchema = createBrandSchema
  .omit({ code: true })
  .partial();

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
