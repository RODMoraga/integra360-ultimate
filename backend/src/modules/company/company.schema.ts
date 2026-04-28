import { z } from "zod";

/**
 * Validation schema for creating a company.
 */
export const createCompanySchema = z.object({
  code: z.string().min(1).max(40),
  legal_name: z.string().min(1).max(180),
  trade_name: z.string().max(180).optional(),
  tax_id: z.string().min(1).max(30),
  industry_type: z.string().max(60).optional(),
  email: z.string().email().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  address_line: z.string().max(220).optional(),
  commune_id: z.coerce.number().positive().optional(),
  timezone: z.string().max(80).optional().default("America/Santiago"),
  currency_code: z.string().length(3).optional().default("CLP"),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for updates.
 * Immutable fields are intentionally excluded.
 */
export const updateCompanySchema = createCompanySchema
  .omit({ code: true, tax_id: true })
  .partial();

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
