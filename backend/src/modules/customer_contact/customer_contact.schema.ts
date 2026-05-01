import { z } from "zod";

/**
 * Validation schema for creating a customer contact.
 */
export const createCustomerContactSchema = z.object({
  customer_id: z.coerce.number().positive({ message: "El cliente es obligatorio" }),
  full_name: z.string().min(1, { message: "El nombre completo es obligatorio" }).max(140),
  email: z.string().email({ message: "El formato del email no es válido" }).max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  role_name: z.string().max(80).optional(),
  is_primary: z.coerce.boolean().optional().default(false)
});

/**
 * Validation schema for partial updates.
 * `customer_id` is immutable after creation.
 */
export const updateCustomerContactSchema = createCustomerContactSchema
  .omit({ customer_id: true })
  .partial();

export type CreateCustomerContactDto = z.infer<typeof createCustomerContactSchema>;
export type UpdateCustomerContactDto = z.infer<typeof updateCustomerContactSchema>;
