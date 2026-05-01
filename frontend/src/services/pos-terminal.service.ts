import { api } from "./api";

/**
 * DTO returned by the POS terminals API.
 */
export interface PosTerminalItem {
  id: string;
  company_id: string;
  warehouse_id: string;
  warehouse_code: string | null;
  warehouse_name: string | null;
  code: string;
  name: string;
  device_name: string | null;
  serial_number: string | null;
  is_active: boolean;
  cash_registers_count: number;
  sales_count: number;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update POS terminal endpoints.
 */
export interface PosTerminalPayload {
  warehouse_id?: number;
  code?: string;
  name?: string;
  device_name?: string;
  serial_number?: string;
  is_active?: boolean;
}

/**
 * Client service for POS terminal endpoints.
 */
export const posTerminalService = {
  /**
   * Retrieves all POS terminals.
   */
  async list(): Promise<PosTerminalItem[]> {
    const { data } = await api.get<PosTerminalItem[]>("/pos-terminals");
    return data;
  },

  /**
   * Retrieves one POS terminal by id.
   */
  async getById(id: string): Promise<PosTerminalItem> {
    const { data } = await api.get<PosTerminalItem>(`/pos-terminals/${id}`);
    return data;
  },

  /**
   * Creates a new POS terminal.
   */
  async create(payload: PosTerminalPayload & { warehouse_id: number; code: string; name: string }): Promise<PosTerminalItem> {
    const { data } = await api.post<PosTerminalItem>("/pos-terminals", payload);
    return data;
  },

  /**
   * Updates an existing POS terminal.
   */
  async update(id: string, payload: PosTerminalPayload): Promise<PosTerminalItem> {
    const { data } = await api.put<PosTerminalItem>(`/pos-terminals/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes one POS terminal.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/pos-terminals/${id}`);
  }
};
