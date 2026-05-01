import { api } from "./api";

/**
 * DTO returned by the warehouses API.
 */
export interface WarehouseItem {
  id: string;
  company_id: string;
  code: string;
  name: string;
  address_line: string | null;
  commune_id: string | null;
  commune_name: string | null;
  city_name: string | null;
  region_name: string | null;
  is_main: boolean;
  is_active: boolean;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update warehouse endpoints.
 */
export interface WarehousePayload {
  code?: string;
  name?: string;
  address_line?: string;
  commune_id?: number;
  is_main?: boolean;
  is_active?: boolean;
}

/**
 * Client service for warehouse endpoints.
 */
export const warehouseService = {
  /**
   * Retrieves all warehouses.
   */
  async list(): Promise<WarehouseItem[]> {
    const { data } = await api.get<WarehouseItem[]>("/warehouses");
    return data;
  },

  /**
   * Retrieves one warehouse by id.
   */
  async getById(id: string): Promise<WarehouseItem> {
    const { data } = await api.get<WarehouseItem>(`/warehouses/${id}`);
    return data;
  },

  /**
   * Creates a new warehouse.
   */
  async create(payload: WarehousePayload & { code: string; name: string }): Promise<WarehouseItem> {
    const { data } = await api.post<WarehouseItem>("/warehouses", payload);
    return data;
  },

  /**
   * Updates an existing warehouse.
   */
  async update(id: string, payload: WarehousePayload): Promise<WarehouseItem> {
    const { data } = await api.put<WarehouseItem>(`/warehouses/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes one warehouse.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  }
};
