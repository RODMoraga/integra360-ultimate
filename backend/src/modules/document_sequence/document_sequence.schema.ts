import { z } from "zod";

/**
 * Validation schema for creating a document sequence.
 */
export const createDocumentSequenceSchema = z.object({
  document_type_id: z.coerce.number().int().positive(),
  year_num: z.coerce.number().int().min(2000).max(9999),
  next_number: z.coerce.number().int().positive().default(1)
});

/**
 * Validation schema for sequence updates.
 */
export const updateDocumentSequenceSchema = createDocumentSequenceSchema.partial();

export type CreateDocumentSequenceDto = z.infer<typeof createDocumentSequenceSchema>;
export type UpdateDocumentSequenceDto = z.infer<typeof updateDocumentSequenceSchema>;
