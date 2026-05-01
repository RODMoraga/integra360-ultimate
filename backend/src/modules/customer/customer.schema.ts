import { z } from "zod";

/**
 * Validation schema for creating a customer.
 */
export const createCustomerSchema = z.object({
  code: z.string().min(1).max(40),
  tax_id: z.string().max(30).optional().or(z.literal("")),
  legal_name: z.string().min(1).max(180),
  business_activity: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  address_line: z.string().max(220).optional().or(z.literal("")),
  commune_id: z.coerce.number().positive().optional(),
  payment_terms_days: z.coerce.number().min(0).max(365).optional().default(0),
  credit_limit: z.coerce.number().min(0).optional().default(0),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for updates.
 * `code` is intentionally immutable.
 */
export const updateCustomerSchema = createCustomerSchema
  .omit({ code: true })
  .partial();

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
