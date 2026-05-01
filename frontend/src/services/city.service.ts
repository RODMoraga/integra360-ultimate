import { api } from "./api";

/**
 * DTO returned by the cities API.
 */
export interface CityItem {
  id: string;
  region_id: string;
  region_country_code: string | null;
  region_code: string | null;
  region_name: string | null;
  code: string;
  name: string;
  communes_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update city endpoints.
 */
export interface CityPayload {
  region_id?: number;
  code?: string;
  name?: string;
}

/**
 * Client service for city endpoints.
 */
export const cityService = {
  /**
   * Retrieves all cities.
   */
  async list(): Promise<CityItem[]> {
    const { data } = await api.get<CityItem[]>("/cities");
    return data;
  },

  /**
   * Retrieves one city by id.
   */
  async getById(id: string): Promise<CityItem> {
    const { data } = await api.get<CityItem>(`/cities/${id}`);
    return data;
  },

  /**
   * Creates a new city.
   */
  async create(payload: CityPayload): Promise<CityItem> {
    const { data } = await api.post<CityItem>("/cities", payload);
    return data;
  },

  /**
   * Updates an existing city.
   */
  async update(id: string, payload: CityPayload): Promise<CityItem> {
    const { data } = await api.put<CityItem>(`/cities/${id}`, payload);
    return data;
  },

  /**
   * Deletes a city by id.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/cities/${id}`);
  }
};
