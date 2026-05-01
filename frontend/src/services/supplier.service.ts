import { api } from "./api";

/**
 * DTO returned by the suppliers API.
 */
export interface SupplierItem {
  id: string;
  company_id: string;
  code: string;
  tax_id: string | null;
  legal_name: string;
  business_activity: string | null;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  commune_id: string | null;
  commune_name: string | null;
  city_name: string | null;
  region_name: string | null;
  payment_terms_days: number;
  is_active: boolean;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update supplier endpoints.
 */
export interface SupplierPayload {
  code?: string;
  tax_id?: string;
  legal_name?: string;
  business_activity?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: number;
  payment_terms_days?: number;
  is_active?: boolean;
}

/**
 * Client service for supplier endpoints.
 */
export const supplierService = {
  /**
   * Retrieves all suppliers.
   */
  async list(): Promise<SupplierItem[]> {
    const { data } = await api.get<SupplierItem[]>("/suppliers");
    return data;
  },

  /**
   * Retrieves one supplier by id.
   */
  async getById(id: string): Promise<SupplierItem> {
    const { data } = await api.get<SupplierItem>(`/suppliers/${id}`);
    return data;
  },

  /**
   * Creates a new supplier.
   */
  async create(payload: SupplierPayload & { code: string; legal_name: string }): Promise<SupplierItem> {
    const { data } = await api.post<SupplierItem>("/suppliers", payload);
    return data;
  },

  /**
   * Updates an existing supplier.
   */
  async update(id: string, payload: SupplierPayload): Promise<SupplierItem> {
    const { data } = await api.put<SupplierItem>(`/suppliers/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes one supplier.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  }
};

