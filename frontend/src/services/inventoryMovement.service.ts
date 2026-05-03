import { api } from "./api";

export type InventoryMovementDirection = "IN" | "OUT" | "TRANSFER";

export interface InventoryMovementItem {
  id: string;
  company_id: string;
  movement_type_id: string;
  movement_type_code: string | null;
  movement_type_name: string | null;
  movement_direction: InventoryMovementDirection | null;
  warehouse_id: string;
  warehouse_code: string | null;
  warehouse_name: string | null;
  related_warehouse_id: string | null;
  related_warehouse_code: string | null;
  related_warehouse_name: string | null;
  product_variant_id: string;
  variant_code: string | null;
  variant_name: string | null;
  variant_sku: string | null;
  variant_barcode: string | null;
  product_id: string | null;
  product_name: string | null;
  product_sku: string | null;
  quantity: number;
  unit_cost: number | null;
  movement_date: string;
  reason: string | null;
  source_document_type: string | null;
  source_document_id: string | null;
  created_at: string;
  created_by: string | null;
  is_transfer: boolean;
}

export interface InventoryMovementPayload {
  movement_type_id?: number;
  warehouse_id?: number;
  related_warehouse_id?: number | null;
  product_variant_id?: number;
  quantity?: number;
  unit_cost?: number | null;
  movement_date?: string;
  reason?: string | null;
  source_document_type?: string | null;
  source_document_id?: number | null;
}

export interface InventoryMovementListParams {
  movement_type_id?: number;
  warehouse_id?: number;
  product_variant_id?: number;
  date_from?: string;
  date_to?: string;
}

export const inventoryMovementService = {
  async list(params?: InventoryMovementListParams): Promise<InventoryMovementItem[]> {
    const query = new URLSearchParams();
    if (params?.movement_type_id) query.set("movement_type_id", String(params.movement_type_id));
    if (params?.warehouse_id) query.set("warehouse_id", String(params.warehouse_id));
    if (params?.product_variant_id) query.set("product_variant_id", String(params.product_variant_id));
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);

    const qs = query.toString();
    const { data } = await api.get<InventoryMovementItem[]>(`/inventory-movements${qs ? `?${qs}` : ""}`);
    return data;
  },

  async getById(id: string): Promise<InventoryMovementItem> {
    const { data } = await api.get<InventoryMovementItem>(`/inventory-movements/${id}`);
    return data;
  },

  async create(
    payload: InventoryMovementPayload & {
      movement_type_id: number;
      warehouse_id: number;
      product_variant_id: number;
      quantity: number;
    }
  ): Promise<InventoryMovementItem> {
    const { data } = await api.post<InventoryMovementItem>("/inventory-movements", payload);
    return data;
  },

  async update(id: string, payload: InventoryMovementPayload): Promise<InventoryMovementItem> {
    const { data } = await api.put<InventoryMovementItem>(`/inventory-movements/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/inventory-movements/${id}`);
  }
};
