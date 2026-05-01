import { api } from "./api";

/**
 * DTO returned by the digital assets API.
 */
export interface DigitalAssetItem {
  id: string;
  company_id: string;
  storage_disk: string;
  storage_key: string;
  original_filename: string | null;
  public_url: string | null;
  mime_type: string;
  extension: string | null;
  size_bytes: string;
  width_px: number | null;
  height_px: number | null;
  sha256_hash: string | null;
  metadata_json: unknown;
  is_active: boolean;
  product_images_count: number;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update digital asset endpoints.
 */
export interface DigitalAssetPayload {
  storage_disk?: string;
  storage_key?: string;
  original_filename?: string;
  public_url?: string;
  mime_type?: string;
  extension?: string;
  size_bytes?: number;
  width_px?: number;
  height_px?: number;
  sha256_hash?: string;
  metadata_json?: unknown;
  is_active?: boolean;
}

/**
 * Client service for digital asset endpoints.
 */
export const digitalAssetService = {
  async list(): Promise<DigitalAssetItem[]> {
    const { data } = await api.get<DigitalAssetItem[]>("/digital-assets");
    return data;
  },

  async getById(id: string): Promise<DigitalAssetItem> {
    const { data } = await api.get<DigitalAssetItem>(`/digital-assets/${id}`);
    return data;
  },

  async create(payload: Required<Pick<DigitalAssetPayload, "storage_key" | "mime_type" | "size_bytes">> & DigitalAssetPayload): Promise<DigitalAssetItem> {
    const { data } = await api.post<DigitalAssetItem>("/digital-assets", payload);
    return data;
  },

  async update(id: string, payload: DigitalAssetPayload): Promise<DigitalAssetItem> {
    const { data } = await api.put<DigitalAssetItem>(`/digital-assets/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/digital-assets/${id}`);
  }
};
