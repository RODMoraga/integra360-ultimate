import { api } from "./api";

/**
 * DTO returned by the document types API.
 */
export interface DocumentTypeItem {
  id: string;
  code: string;
  name: string;
  counterpart_scope: "CUSTOMER" | "SUPPLIER" | "NONE";
  counterpart_scope_label: string;
  affects_inventory: boolean;
  affects_accounting: boolean;
  documents_count: number;
  document_sequences_count: number;
  dependencies_count: number;
  created_at: string;
}

/**
 * Payload accepted by create/update document type endpoints.
 */
export interface DocumentTypePayload {
  code?: string;
  name?: string;
  counterpart_scope?: "CUSTOMER" | "SUPPLIER" | "NONE";
  affects_inventory?: boolean;
  affects_accounting?: boolean;
}

/**
 * Client service for document type endpoints.
 */
export const documentTypeService = {
  async list(): Promise<DocumentTypeItem[]> {
    const { data } = await api.get<DocumentTypeItem[]>("/document-types");
    return data;
  },

  async getById(id: string): Promise<DocumentTypeItem> {
    const { data } = await api.get<DocumentTypeItem>(`/document-types/${id}`);
    return data;
  },

  async create(payload: DocumentTypePayload & { code: string; name: string }): Promise<DocumentTypeItem> {
    const { data } = await api.post<DocumentTypeItem>("/document-types", payload);
    return data;
  },

  async update(id: string, payload: DocumentTypePayload): Promise<DocumentTypeItem> {
    const { data } = await api.put<DocumentTypeItem>(`/document-types/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/document-types/${id}`);
  }
};
