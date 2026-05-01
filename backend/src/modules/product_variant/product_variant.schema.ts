import { z } from "zod";

/**
 * Validation schema for creating a product variant.
 */
export const createProductVariantSchema = z.object({
  product_id: z.coerce.number().positive({ message: "El producto es obligatorio" }),
  variant_code: z.string().min(1, "El código de variante es obligatorio").max(60),
  name: z.string().min(1, "El nombre es obligatorio").max(180),
  attributes_json: z.unknown().optional().nullable(),
  sku: z.string().max(60).optional().nullable().or(z.literal("")),
  barcode: z.string().max(80).optional().nullable().or(z.literal("")),
  cost_price: z.coerce.number().min(0).default(0),
  sale_price: z.coerce.number().min(0).default(0),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for partial updates.
 * `product_id` and `variant_code` are intentionally immutable after creation.
 */
export const updateProductVariantSchema = createProductVariantSchema
  .omit({ product_id: true, variant_code: true })
  .partial();

export type CreateProductVariantDto = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantDto = z.infer<typeof updateProductVariantSchema>;
