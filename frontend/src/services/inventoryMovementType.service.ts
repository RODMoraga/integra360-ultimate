import { api } from "../services/api";

export type InventoryMovementDirection = "IN" | "OUT" | "TRANSFER";

export interface InventoryMovementTypeItem {
  id: string;
  code: string;
  name: string;
  direction: InventoryMovementDirection;
  created_at: string;
  movements_count: number;
  is_system: boolean;
}

export interface InventoryMovementTypePayload {
  code?: string;
  name?: string;
  direction?: InventoryMovementDirection;
}

export const inventoryMovementTypeService = {
  async list(): Promise<InventoryMovementTypeItem[]> {
    const { data } = await api.get<InventoryMovementTypeItem[]>("/inventory-movement-types");
    return data;
  },

  async getById(id: string): Promise<InventoryMovementTypeItem> {
    const { data } = await api.get<InventoryMovementTypeItem>(`/inventory-movement-types/${id}`);
    return data;
  },

  async create(payload: Required<Pick<InventoryMovementTypePayload, "code" | "name" | "direction">>): Promise<InventoryMovementTypeItem> {
    const { data } = await api.post<InventoryMovementTypeItem>("/inventory-movement-types", payload);
    return data;
  },

  async update(id: string, payload: InventoryMovementTypePayload): Promise<InventoryMovementTypeItem> {
    const { data } = await api.put<InventoryMovementTypeItem>(`/inventory-movement-types/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/inventory-movement-types/${id}`);
  }
};