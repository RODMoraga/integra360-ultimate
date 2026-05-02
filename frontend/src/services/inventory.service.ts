import { api } from "./api";

export interface InventoryItem {
  id: string;
  company_id: string;
  warehouse_id: string;
  warehouse_code: string | null;
  warehouse_name: string | null;
  warehouse_active: boolean | null;
  product_variant_id: string;
  variant_code: string | null;
  variant_name: string | null;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_active: boolean | null;
  product_id: string | null;
  product_name: string | null;
  product_sku: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  min_stock: number;
  max_stock: number | null;
  reorder_point: number | null;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryPayload {
  warehouse_id?: number;
  product_variant_id?: number;
  quantity_on_hand?: number;
  quantity_reserved?: number;
  min_stock?: number;
  max_stock?: number | null;
  reorder_point?: number | null;
}

export interface InventoryListParams {
  warehouse_id?: number;
  low_stock?: boolean;
}

export const inventoryService = {
  async list(params?: InventoryListParams): Promise<InventoryItem[]> {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set("warehouse_id", String(params.warehouse_id));
    if (params?.low_stock) query.set("low_stock", "true");
    const qs = query.toString();
    const { data } = await api.get<InventoryItem[]>(`/inventory${qs ? `?${qs}` : ""}`);
    return data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const { data } = await api.get<InventoryItem>(`/inventory/${id}`);
    return data;
  },

  async create(payload: InventoryPayload & { warehouse_id: number; product_variant_id: number }): Promise<InventoryItem> {
    const { data } = await api.post<InventoryItem>("/inventory", payload);
    return data;
  },

  async update(id: string, payload: Omit<InventoryPayload, "warehouse_id" | "product_variant_id">): Promise<InventoryItem> {
    const { data } = await api.put<InventoryItem>(`/inventory/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`);
  }
};
