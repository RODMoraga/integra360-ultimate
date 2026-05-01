import { api } from "./api";

/**
 * DTO returned by the customer-contacts API.
 */
export interface CustomerContactItem {
  id: string;
  company_id: string;
  customer_id: string;
  customer_legal_name: string | null;
  customer_code: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role_name: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update contact endpoints.
 */
export interface CustomerContactPayload {
  customer_id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  role_name?: string;
  is_primary?: boolean;
}

/**
 * Client service for customer-contacts endpoints.
 */
export const customerContactService = {
  async list(): Promise<CustomerContactItem[]> {
    const { data } = await api.get<CustomerContactItem[]>("/customer-contacts");
    return data;
  },

  async getById(id: string): Promise<CustomerContactItem> {
    const { data } = await api.get<CustomerContactItem>(`/customer-contacts/${id}`);
    return data;
  },

  async create(payload: CustomerContactPayload & { customer_id: number; full_name: string }): Promise<CustomerContactItem> {
    const { data } = await api.post<CustomerContactItem>("/customer-contacts", payload);
    return data;
  },

  async update(id: string, payload: CustomerContactPayload): Promise<CustomerContactItem> {
    const { data } = await api.put<CustomerContactItem>(`/customer-contacts/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/customer-contacts/${id}`);
  }
};
