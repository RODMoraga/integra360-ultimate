import { api } from "./api";

/**
 * DTO returned by the units-of-measure API.
 */
export interface UnitOfMeasureItem {
  id: string;
  company_id: string;
  code: string;
  name: string;
  symbol: string;
  unit_type: string;
  is_base_unit: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update unit-of-measure endpoints.
 */
export interface UnitOfMeasurePayload {
  code?: string;
  name?: string;
  symbol?: string;
  unit_type?: string;
  is_base_unit?: boolean;
}

/**
 * Client service for unit-of-measure endpoints.
 */
export const unitOfMeasureService = {
  /**
   * Retrieves all active units for the authenticated user's company.
   */
  async list(): Promise<UnitOfMeasureItem[]> {
    const { data } = await api.get<UnitOfMeasureItem[]>("/units-of-measure");
    return data;
  },

  /**
   * Retrieves one unit by id.
   */
  async getById(id: string): Promise<UnitOfMeasureItem> {
    const { data } = await api.get<UnitOfMeasureItem>(`/units-of-measure/${id}`);
    return data;
  },

  /**
   * Creates a new unit of measure.
   */
  async create(
    payload: UnitOfMeasurePayload & { code: string; name: string; symbol: string; unit_type: string }
  ): Promise<UnitOfMeasureItem> {
    const { data } = await api.post<UnitOfMeasureItem>("/units-of-measure", payload);
    return data;
  },

  /**
   * Updates an existing unit of measure.
   */
  async update(id: string, payload: UnitOfMeasurePayload): Promise<UnitOfMeasureItem> {
    const { data } = await api.put<UnitOfMeasureItem>(`/units-of-measure/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes a unit of measure.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/units-of-measure/${id}`);
  }
};
