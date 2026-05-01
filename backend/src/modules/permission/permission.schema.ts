import { z } from "zod";

/**
 * Validation schema for creating a permission.
 */
export const createPermissionSchema = z.object({
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  module_name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(255).optional()
});

/**
 * Validation schema for permission updates.
 * The `code` field is intentionally immutable.
 */
export const updatePermissionSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  module_name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(255).optional()
});

export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>;
