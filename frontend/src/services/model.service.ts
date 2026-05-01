import { api } from "./api";

/**
 * DTO returned by the models API.
 */
export interface ModelItem {
  id: string;
  company_id: string;
  brand_id: string;
  brand_code: string | null;
  brand_name: string | null;
  code: string;
  name: string;
  dependencies_count: number;
  products_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for model brand options.
 */
export interface ModelBrandOption {
  id: string;
  code: string;
  name: string;
}

/**
 * Payload accepted by create/update model endpoints.
 */
export interface ModelPayload {
  brand_id?: number;
  code?: string;
  name?: string;
}

/**
 * Client service for model endpoints.
 */
export const modelService = {
  async list(): Promise<ModelItem[]> {
    const { data } = await api.get<ModelItem[]>("/models");
    return data;
  },

  async listBrands(): Promise<ModelBrandOption[]> {
    const { data } = await api.get<ModelBrandOption[]>("/models/brands");
    return data;
  },

  async getById(id: string): Promise<ModelItem> {
    const { data } = await api.get<ModelItem>(`/models/${id}`);
    return data;
  },

  async create(payload: ModelPayload & { brand_id: number; code: string; name: string }): Promise<ModelItem> {
    const { data } = await api.post<ModelItem>("/models", payload);
    return data;
  },

  async update(id: string, payload: ModelPayload): Promise<ModelItem> {
    const { data } = await api.put<ModelItem>(`/models/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/models/${id}`);
  }
};