import { z } from "zod";

/**
 * Validation schema for creating a product.
 */
export const createProductSchema = z.object({
  sku: z.string().min(1).max(60),
  barcode: z.string().max(80).optional().nullable(),
  name: z.string().min(1).max(180),
  description: z.string().optional().nullable(),
  category_id: z.coerce.number().positive().optional().nullable(),
  subcategory_id: z.coerce.number().positive().optional().nullable(),
  brand_id: z.coerce.number().positive().optional().nullable(),
  model_id: z.coerce.number().positive().optional().nullable(),
  base_uom_id: z.coerce.number().positive(),
  tax_rate: z.coerce.number().min(0).default(0),
  cost_price: z.coerce.number().min(0).default(0),
  sale_price: z.coerce.number().min(0).default(0),
  min_price: z.coerce.number().min(0).optional().nullable(),
  is_featured: z.boolean().default(false),
  track_inventory: z.boolean().default(true),
  min_stock: z.coerce.number().min(0).default(0),
  is_service: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

/**
 * Validation schema for product updates.
 * `sku` is intentionally immutable after creation.
 */
export const updateProductSchema = createProductSchema
  .omit({ sku: true })
  .partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
