import { z } from "zod";

const statusEnum = z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]);

const documentDetailLineSchema = z.object({
  product_variant_id: z.coerce.number().int().positive(),
  warehouse_id: z.coerce.number().int().positive().optional(),
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
  discount_amount: z.coerce.number().min(0).optional().default(0),
  tax_amount: z.coerce.number().min(0).optional().default(0)
});

export const createDocumentSchema = z.object({
  document_type_id: z.coerce.number().int().positive(),
  document_date: z.coerce.date().optional(),
  warehouse_id: z.coerce.number().int().positive().optional(),
  customer_id: z.coerce.number().int().positive().optional(),
  supplier_id: z.coerce.number().int().positive().optional(),
  status: statusEnum.optional().default("DRAFT"),
  notes: z.string().trim().max(255).optional().or(z.literal("")),
  details: z.array(documentDetailLineSchema).min(1)
});

export const updateDocumentSchema = z.object({
  document_date: z.coerce.date().optional(),
  warehouse_id: z.coerce.number().int().positive().optional(),
  customer_id: z.coerce.number().int().positive().optional(),
  supplier_id: z.coerce.number().int().positive().optional(),
  status: statusEnum.optional(),
  notes: z.string().trim().max(255).optional().or(z.literal("")),
  details: z.array(documentDetailLineSchema).min(1).optional()
});

export type CreateDocumentDto = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentDto = z.infer<typeof updateDocumentSchema>;
