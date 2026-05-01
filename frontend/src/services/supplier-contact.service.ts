import { api } from "./api";

/**
 * Shape of a supplier contact as returned by the API.
 */
export interface SupplierContactItem {
  id: string;
  company_id: string;
  supplier_id: string;
  supplier_legal_name: string | null;
  supplier_code: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role_name: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Shape of the request body for create/update operations.
 */
export interface SupplierContactPayload {
  supplier_id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  role_name?: string;
  is_primary?: boolean;
}

/**
 * Fetches all active supplier contacts for the authenticated company.
 */
export async function fetchSupplierContacts(): Promise<SupplierContactItem[]> {
  const { data } = await api.get<SupplierContactItem[]>("/supplier-contacts");
  return data;
}

/**
 * Creates a new supplier contact.
 */
export async function createSupplierContact(
  payload: SupplierContactPayload
): Promise<SupplierContactItem> {
  const { data } = await api.post<SupplierContactItem>("/supplier-contacts", payload);
  return data;
}

/**
 * Updates an existing supplier contact.
 */
export async function updateSupplierContact(
  id: string,
  payload: SupplierContactPayload
): Promise<SupplierContactItem> {
  const { data } = await api.put<SupplierContactItem>(`/supplier-contacts/${id}`, payload);
  return data;
}

/**
 * Soft-deletes a supplier contact by id.
 */
export async function deleteSupplierContact(id: string): Promise<void> {
  await api.delete(`/supplier-contacts/${id}`);
}
