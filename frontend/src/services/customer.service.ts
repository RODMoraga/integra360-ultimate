import { api } from "./api";

/**
 * DTO returned by the customers API.
 */
export interface CustomerItem {
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
  credit_limit: number;
  is_active: boolean;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update customer endpoints.
 */
export interface CustomerPayload {
  code?: string;
  tax_id?: string;
  legal_name?: string;
  business_activity?: string;
  email?: string;
  phone?: string;
  address_line?: string;
  commune_id?: number;
  payment_terms_days?: number;
  credit_limit?: number;
  is_active?: boolean;
}

/**
 * Client service for customer endpoints.
 */
export const customerService = {
  /**
   * Retrieves all customers.
   */
  async list(): Promise<CustomerItem[]> {
    const { data } = await api.get<CustomerItem[]>("/customers");
    return data;
  },

  /**
   * Retrieves one customer by id.
   */
  async getById(id: string): Promise<CustomerItem> {
    const { data } = await api.get<CustomerItem>(`/customers/${id}`);
    return data;
  },

  /**
   * Creates a new customer.
   */
  async create(payload: CustomerPayload & { code: string; legal_name: string }): Promise<CustomerItem> {
    const { data } = await api.post<CustomerItem>("/customers", payload);
    return data;
  },

  /**
   * Updates an existing customer.
   */
  async update(id: string, payload: CustomerPayload): Promise<CustomerItem> {
    const { data } = await api.put<CustomerItem>(`/customers/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes one customer.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  }
};
