import { z } from "zod";

/**
 * Validation schema for creating a subcategory.
 */
export const createSubcategorySchema = z.object({
  category_id: z.coerce.number().positive(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  description: z.string().max(255).optional().or(z.literal("")),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable.
 */
export const updateSubcategorySchema = createSubcategorySchema
  .omit({ code: true })
  .partial();

export type CreateSubcategoryDto = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryDto = z.infer<typeof updateSubcategorySchema>;