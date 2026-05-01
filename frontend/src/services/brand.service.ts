import { api } from "./api";

/**
 * DTO returned by the brands API.
 */
export interface BrandItem {
  id: string;
  company_id: string;
  code: string;
  name: string;
  models_count: number;
  products_count: number;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update brand endpoints.
 */
export interface BrandPayload {
  code?: string;
  name?: string;
}

/**
 * Client service for brand endpoints.
 */
export const brandService = {
  async list(): Promise<BrandItem[]> {
    const { data } = await api.get<BrandItem[]>("/brands");
    return data;
  },

  async getById(id: string): Promise<BrandItem> {
    const { data } = await api.get<BrandItem>(`/brands/${id}`);
    return data;
  },

  async create(payload: BrandPayload & { code: string; name: string }): Promise<BrandItem> {
    const { data } = await api.post<BrandItem>("/brands", payload);
    return data;
  },

  async update(id: string, payload: BrandPayload): Promise<BrandItem> {
    const { data } = await api.put<BrandItem>(`/brands/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/brands/${id}`);
  }
};
