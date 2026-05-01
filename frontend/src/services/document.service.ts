import { api } from "./api";

export type DocumentStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface DocumentDetailItem {
  id: string;
  line_number: number;
  product_variant_id: string;
  product_variant_code: string | null;
  product_variant_name: string | null;
  product_variant_sku: string | null;
  product_variant_barcode: string | null;
  product_name: string | null;
  product_sku: string | null;
  warehouse_id: string | null;
  warehouse_code: string | null;
  warehouse_name: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
}

export interface DocumentItem {
  id: string;
  company_id: string;
  document_type_id: string;
  document_type_code: string | null;
  document_type_name: string | null;
  counterpart_scope: "CUSTOMER" | "SUPPLIER" | "NONE" | null;
  sequence_number: string;
  document_number_label: string;
  document_date: string;
  warehouse_id: string | null;
  warehouse_code: string | null;
  warehouse_name: string | null;
  customer_id: string | null;
  customer_code: string | null;
  customer_name: string | null;
  supplier_id: string | null;
  supplier_code: string | null;
  supplier_name: string | null;
  partner_name: string | null;
  status: DocumentStatus;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  notes: string | null;
  confirmed_at: string | null;
  details_count: number;
  created_at: string;
  updated_at: string;
  details?: DocumentDetailItem[];
}

export interface DocumentListFilters {
  partner_name?: string;
  status?: DocumentStatus | "";
  date_from?: string;
  date_to?: string;
}

export interface DocumentDetailPayload {
  product_variant_id: number;
  warehouse_id?: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
}

export interface DocumentPayload {
  document_type_id?: number;
  document_date?: string;
  warehouse_id?: number;
  customer_id?: number;
  supplier_id?: number;
  status?: DocumentStatus;
  notes?: string;
  details?: DocumentDetailPayload[];
}

export const documentService = {
  async list(filters?: DocumentListFilters): Promise<DocumentItem[]> {
    const { data } = await api.get<DocumentItem[]>("/documents", { params: filters });
    return data;
  },

  async getById(id: string): Promise<DocumentItem> {
    const { data } = await api.get<DocumentItem>(`/documents/${id}`);
    return data;
  },

  async create(payload: DocumentPayload & { document_type_id: number; details: DocumentDetailPayload[] }): Promise<DocumentItem> {
    const { data } = await api.post<DocumentItem>("/documents", payload);
    return data;
  },

  async update(id: string, payload: DocumentPayload): Promise<DocumentItem> {
    const { data } = await api.put<DocumentItem>(`/documents/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  }
};
