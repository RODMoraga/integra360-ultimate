import { api } from "./api";

/**
 * DTO returned by the regions API.
 */
export interface RegionItem {
  id: string;
  country_code: string;
  code: string;
  name: string;
  cities_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update region endpoints.
 */
export interface RegionPayload {
  country_code?: string;
  code?: string;
  name?: string;
}

/**
 * Client service for region endpoints.
 */
export const regionService = {
  /**
   * Retrieves all regions.
   */
  async list(): Promise<RegionItem[]> {
    const { data } = await api.get<RegionItem[]>("/regions");
    return data;
  },

  /**
   * Retrieves one region by id.
   */
  async getById(id: string): Promise<RegionItem> {
    const { data } = await api.get<RegionItem>(`/regions/${id}`);
    return data;
  },

  /**
   * Creates a new region.
   */
  async create(payload: RegionPayload): Promise<RegionItem> {
    const { data } = await api.post<RegionItem>("/regions", payload);
    return data;
  },

  /**
   * Updates an existing region.
   */
  async update(id: string, payload: RegionPayload): Promise<RegionItem> {
    const { data } = await api.put<RegionItem>(`/regions/${id}`, payload);
    return data;
  },

  /**
   * Deletes a region by id.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/regions/${id}`);
  }
};
