import { z } from "zod";

export const createCashRegisterSchema = z.object({
  terminal_id: z.coerce.number().int().positive(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  is_active: z.coerce.boolean().optional().default(true)
});

export const updateCashRegisterSchema = createCashRegisterSchema
  .omit({ code: true })
  .partial();

export type CreateCashRegisterDto = z.infer<typeof createCashRegisterSchema>;
export type UpdateCashRegisterDto = z.infer<typeof updateCashRegisterSchema>;
