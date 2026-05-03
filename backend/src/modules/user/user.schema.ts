import { z } from "zod";

/**
 * Validation schema for user creation payloads.
 */
export const createUserSchema = z.object({
  full_name: z.string().trim().min(3).max(160),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(64),
  role_ids: z.array(z.coerce.number().int().positive()).optional().default([]),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for partial user updates.
 */
export const updateUserSchema = z.object({
  full_name: z.string().trim().min(3).max(160).optional(),
  email: z.string().trim().email().max(160).optional(),
  password: z.string().min(8).max(64).optional(),
  role_ids: z.array(z.coerce.number().int().positive()).optional(),
  is_active: z.coerce.boolean().optional()
});

/**
 * Validation schema for authenticated user profile updates.
 * Only mutable self-service fields are allowed.
 */
export const updateMyProfileSchema = z.object({
  full_name: z.string().trim().min(3).max(160).optional(),
  email: z.string().trim().email().max(160).optional()
}).refine((value) => value.full_name !== undefined || value.email !== undefined, {
  message: "Debe enviar al menos un campo para actualizar"
});

/**
 * Validation schema for authenticated user password rotation.
 */
export const updateMyPasswordSchema = z.object({
  current_password: z.string().min(8).max(64),
  new_password: z.string().min(8).max(64)
}).superRefine((value, ctx) => {
  if (value.current_password === value.new_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La nueva contraseña debe ser diferente a la actual"
    });
  }
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UpdateMyProfileDto = z.infer<typeof updateMyProfileSchema>;
export type UpdateMyPasswordDto = z.infer<typeof updateMyPasswordSchema>;
