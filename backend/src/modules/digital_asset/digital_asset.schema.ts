import { z } from "zod";

/**
 * Validation schema for creating a digital asset.
 */
export const createDigitalAssetSchema = z.object({
  storage_disk: z.string().trim().min(1).max(40).default("local"),
  storage_key: z.string().trim().min(1).max(255),
  original_filename: z.string().trim().max(255).optional().or(z.literal("")),
  public_url: z.string().trim().max(700).optional().or(z.literal("")),
  mime_type: z.string().trim().min(1).max(120),
  extension: z.string().trim().max(20).optional().or(z.literal("")),
  size_bytes: z.coerce.number().int().nonnegative().default(0),
  width_px: z.coerce.number().int().positive().optional(),
  height_px: z.coerce.number().int().positive().optional(),
  sha256_hash: z.string().trim().regex(/^[a-fA-F0-9]{64}$/).optional().or(z.literal("")),
  metadata_json: z.unknown().optional(),
  is_active: z.coerce.boolean().optional().default(true)
});

/**
 * Validation schema for digital asset updates.
 */
export const updateDigitalAssetSchema = createDigitalAssetSchema.partial();

export type CreateDigitalAssetDto = z.infer<typeof createDigitalAssetSchema>;
export type UpdateDigitalAssetDto = z.infer<typeof updateDigitalAssetSchema>;
