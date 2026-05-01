import { api } from "./api";

/**
 * DTO returned by the communes API.
 */
export interface CommuneItem {
  id: string;
  city_id: string;
  city_code: string | null;
  city_name: string | null;
  region_id: string | null;
  region_country_code: string | null;
  region_code: string | null;
  region_name: string | null;
  code: string;
  name: string;
  postal_code: string | null;
  companies_count: number;
  customers_count: number;
  suppliers_count: number;
  warehouses_count: number;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update commune endpoints.
 */
export interface CommunePayload {
  city_id?: number;
  code?: string;
  name?: string;
  postal_code?: string;
}

/**
 * Client service for commune endpoints.
 */
export const communeService = {
  /**
   * Retrieves all communes.
   */
  async list(): Promise<CommuneItem[]> {
    const { data } = await api.get<CommuneItem[]>("/communes");
    return data;
  },

  /**
   * Retrieves one commune by id.
   */
  async getById(id: string): Promise<CommuneItem> {
    const { data } = await api.get<CommuneItem>(`/communes/${id}`);
    return data;
  },

  /**
   * Creates a new commune.
   */
  async create(payload: CommunePayload): Promise<CommuneItem> {
    const { data } = await api.post<CommuneItem>("/communes", payload);
    return data;
  },

  /**
   * Updates an existing commune.
   */
  async update(id: string, payload: CommunePayload): Promise<CommuneItem> {
    const { data } = await api.put<CommuneItem>(`/communes/${id}`, payload);
    return data;
  },

  /**
   * Deletes a commune by id.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/communes/${id}`);
  }
};
