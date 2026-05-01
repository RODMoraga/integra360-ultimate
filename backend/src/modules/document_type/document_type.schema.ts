import { z } from "zod";

const counterpartScopeEnum = z.enum(["CUSTOMER", "SUPPLIER", "NONE"]);

/**
 * Validation schema for creating a document type.
 */
export const createDocumentTypeSchema = z.object({
  code: z.string().trim().min(1).max(30),
  name: z.string().trim().min(1).max(120),
  counterpart_scope: counterpartScopeEnum.default("NONE"),
  affects_inventory: z.coerce.boolean().optional().default(false),
  affects_accounting: z.coerce.boolean().optional().default(false)
});

/**
 * Validation schema for document type updates.
 * The `code` field is intentionally immutable.
 */
export const updateDocumentTypeSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  counterpart_scope: counterpartScopeEnum.optional(),
  affects_inventory: z.coerce.boolean().optional(),
  affects_accounting: z.coerce.boolean().optional()
});

export type CreateDocumentTypeDto = z.infer<typeof createDocumentTypeSchema>;
export type UpdateDocumentTypeDto = z.infer<typeof updateDocumentTypeSchema>;
