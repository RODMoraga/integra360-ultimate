import { z } from "zod";

const purposeEnum = z.enum(["PRIMARY", "GALLERY", "THUMBNAIL", "DETAIL", "PACKAGING"]);

/**
 * Validation schema for creating a product image relation.
 */
export const createProductImageSchema = z.object({
  product_id: z.coerce.number().positive({ message: "El producto es obligatorio" }),
  purpose: purposeEnum.optional().default("GALLERY"),
  alt_text: z.string().max(255).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().positive().max(65535).optional(),
  is_primary: z.coerce.boolean().optional().default(false),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for partial updates.
 * `product_id` is immutable after creation.
 */
export const updateProductImageSchema = createProductImageSchema
  .omit({ product_id: true })
  .partial();

export type CreateProductImageDto = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageDto = z.infer<typeof updateProductImageSchema>;
