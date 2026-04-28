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

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
