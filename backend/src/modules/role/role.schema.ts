import { z } from "zod";

/**
 * Validation schema for role creation requests.
 */
export const createRoleSchema = z.object({
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(255).optional(),
  permission_ids: z.array(z.coerce.number().int().positive()).optional().default([])
});

/**
 * Validation schema for partial role updates.
 */
export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(255).optional(),
  permission_ids: z.array(z.coerce.number().int().positive()).optional()
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
