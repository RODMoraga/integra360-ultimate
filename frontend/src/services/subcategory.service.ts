import { api } from "./api";

/**
 * DTO returned by the subcategories API.
 */
export interface SubcategoryItem {
  id: string;
  company_id: string;
  category_id: string;
  category_code: string | null;
  category_name: string | null;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  dependencies_count: number;
  products_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update subcategory endpoints.
 */
export interface SubcategoryPayload {
  category_id?: number;
  code?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Client service for subcategory endpoints.
 */
export const subcategoryService = {
  async list(): Promise<SubcategoryItem[]> {
    const { data } = await api.get<SubcategoryItem[]>("/subcategories");
    return data;
  },

  async getById(id: string): Promise<SubcategoryItem> {
    const { data } = await api.get<SubcategoryItem>(`/subcategories/${id}`);
    return data;
  },

  async create(payload: SubcategoryPayload & { category_id: number; code: string; name: string }): Promise<SubcategoryItem> {
    const { data } = await api.post<SubcategoryItem>("/subcategories", payload);
    return data;
  },

  async update(id: string, payload: SubcategoryPayload): Promise<SubcategoryItem> {
    const { data } = await api.put<SubcategoryItem>(`/subcategories/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/subcategories/${id}`);
  }
};