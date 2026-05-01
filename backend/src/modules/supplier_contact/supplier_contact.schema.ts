import { z } from "zod";

/**
 * Validation schema for creating a supplier contact.
 */
export const createSupplierContactSchema = z.object({
  supplier_id: z.coerce.number().positive({ message: "El proveedor es obligatorio" }),
  full_name: z.string().min(1, { message: "El nombre completo es obligatorio" }).max(140),
  email: z
    .string()
    .email({ message: "El formato del email no es válido" })
    .max(160)
    .optional()
    .or(z.literal("")),
  phone: z.string().max(40).optional(),
  role_name: z.string().max(80).optional(),
  is_primary: z.coerce.boolean().optional().default(false)
});

/**
 * Validation schema for partial updates.
 * `supplier_id` is immutable after creation.
 */
export const updateSupplierContactSchema = createSupplierContactSchema
  .omit({ supplier_id: true })
  .partial();

export type CreateSupplierContactDto = z.infer<typeof createSupplierContactSchema>;
export type UpdateSupplierContactDto = z.infer<typeof updateSupplierContactSchema>;
