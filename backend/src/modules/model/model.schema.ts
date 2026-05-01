import { z } from "zod";

/**
 * Validation schema for creating a model.
 */
export const createModelSchema = z.object({
  brand_id: z.coerce.number().positive(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable.
 */
export const updateModelSchema = createModelSchema
  .omit({ code: true })
  .partial();

export type CreateModelDto = z.infer<typeof createModelSchema>;
export type UpdateModelDto = z.infer<typeof updateModelSchema>;