import { api } from "./api";

export interface ConversionUnitRef {
  id: string;
  code: string;
  name: string;
  symbol: string;
  unit_type: string;
}

/**
 * DTO returned by the unit-conversions API.
 */
export interface UnitConversionItem {
  id: string;
  company_id: string;
  from_unit_id: string;
  to_unit_id: string;
  factor: string;
  from_unit: ConversionUnitRef | null;
  to_unit: ConversionUnitRef | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update unit-conversion endpoints.
 */
export interface UnitConversionPayload {
  from_unit_id?: number;
  to_unit_id?: number;
  factor?: number;
}

/**
 * Client service for unit-conversion endpoints.
 */
export const unitConversionService = {
  /**
   * Retrieves all unit conversions.
   */
  async list(): Promise<UnitConversionItem[]> {
    const { data } = await api.get<UnitConversionItem[]>("/unit-conversions");
    return data;
  },

  /**
   * Retrieves one conversion by id.
   */
  async getById(id: string): Promise<UnitConversionItem> {
    const { data } = await api.get<UnitConversionItem>(`/unit-conversions/${id}`);
    return data;
  },

  /**
   * Creates a new conversion.
   */
  async create(
    payload: UnitConversionPayload & { from_unit_id: number; to_unit_id: number; factor: number }
  ): Promise<UnitConversionItem> {
    const { data } = await api.post<UnitConversionItem>("/unit-conversions", payload);
    return data;
  },

  /**
   * Updates one conversion.
   */
  async update(id: string, payload: UnitConversionPayload): Promise<UnitConversionItem> {
    const { data } = await api.put<UnitConversionItem>(`/unit-conversions/${id}`, payload);
    return data;
  },

  /**
   * Deletes one conversion.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/unit-conversions/${id}`);
  }
};
