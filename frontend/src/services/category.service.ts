import { api } from "./api";

/**
 * DTO returned by the categories API.
 */
export interface CategoryItem {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  dependencies_count: number;
  products_count: number;
  subcategories_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update category endpoints.
 */
export interface CategoryPayload {
  code?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Client service for category endpoints.
 */
export const categoryService = {
  async list(): Promise<CategoryItem[]> {
    const { data } = await api.get<CategoryItem[]>("/categories");
    return data;
  },

  async getById(id: string): Promise<CategoryItem> {
    const { data } = await api.get<CategoryItem>(`/categories/${id}`);
    return data;
  },

  async create(payload: CategoryPayload & { code: string; name: string }): Promise<CategoryItem> {
    const { data } = await api.post<CategoryItem>("/categories", payload);
    return data;
  },

  async update(id: string, payload: CategoryPayload): Promise<CategoryItem> {
    const { data } = await api.put<CategoryItem>(`/categories/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};