import { api } from "./api";

/**
 * DTO returned by the document sequences API.
 */
export interface DocumentSequenceItem {
  id: string;
  company_id: string;
  document_type_id: string;
  document_type_code: string | null;
  document_type_name: string | null;
  document_type_is_active: boolean;
  year_num: number;
  next_number: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update sequence endpoints.
 */
export interface DocumentSequencePayload {
  document_type_id?: number;
  year_num?: number;
  next_number?: number;
}

/**
 * Client service for document sequence endpoints.
 */
export const documentSequenceService = {
  async list(): Promise<DocumentSequenceItem[]> {
    const { data } = await api.get<DocumentSequenceItem[]>("/document-sequences");
    return data;
  },

  async getById(id: string): Promise<DocumentSequenceItem> {
    const { data } = await api.get<DocumentSequenceItem>(`/document-sequences/${id}`);
    return data;
  },

  async create(payload: Required<Pick<DocumentSequencePayload, "document_type_id" | "year_num" | "next_number">> & DocumentSequencePayload): Promise<DocumentSequenceItem> {
    const { data } = await api.post<DocumentSequenceItem>("/document-sequences", payload);
    return data;
  },

  async update(id: string, payload: DocumentSequencePayload): Promise<DocumentSequenceItem> {
    const { data } = await api.put<DocumentSequenceItem>(`/document-sequences/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/document-sequences/${id}`);
  }
};
