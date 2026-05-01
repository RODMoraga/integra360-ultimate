import { z } from "zod";

/**
 * Validation schema for creating a category.
 */
export const createCategorySchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  description: z.string().max(255).optional().or(z.literal("")),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable.
 */
export const updateCategorySchema = createCategorySchema
  .omit({ code: true })
  .partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;