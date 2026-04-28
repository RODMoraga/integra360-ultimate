import { api } from "../services/api";

/**
 * DTO returned by the companies API.
 */
export interface CompanyItem {
  id: string;
  code: string;
  legal_name: string;
  trade_name: string | null;
  tax_id: string;
  industry_type: string | null;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  commune_id: string | null;
  commune_name: string | null;
  city_name: string | null;
  region_name: string | null;
  timezone: string;
  currency_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update company endpoints.
 */
export interface CompanyPayload {
  code?: string;
  legal_name: string;
  trade_name?: string;
  tax_id?: string;
  industry_type?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: number | null;
  timezone?: string;
  currency_code?: string;
  is_active?: boolean;
}

/**
 * Client service for company endpoints.
 */
export const companyService = {
  /**
   * Retrieves all companies.
   */
  async list(): Promise<CompanyItem[]> {
    const { data } = await api.get<CompanyItem[]>("/companies");
    return data;
  },

  /**
   * Retrieves one company by id.
   */
  async getById(id: string): Promise<CompanyItem> {
    const { data } = await api.get<CompanyItem>(`/companies/${id}`);
    return data;
  },

  /**
   * Creates a new company.
   */
  async create(payload: CompanyPayload & { code: string; tax_id: string }): Promise<CompanyItem> {
    const { data } = await api.post<CompanyItem>("/companies", payload);
    return data;
  },

  /**
   * Updates an existing company.
   */
  async update(id: string, payload: CompanyPayload): Promise<CompanyItem> {
    const { data } = await api.put<CompanyItem>(`/companies/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes a company by id.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  }
};
