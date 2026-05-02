import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { inventoryService, InventoryPayload, InventoryListParams } from "../services/inventory.service";

export const INVENTORY_KEY = ["inventory"] as const;

export const useInventory = (params?: InventoryListParams) => {
  return useQuery({
    queryKey: [...INVENTORY_KEY, params ?? {}],
    queryFn: () => inventoryService.list(params)
  });
};

export const useCreateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryPayload & { warehouse_id: number; product_variant_id: number }) =>
      inventoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_KEY })
  });
};

export const useUpdateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<InventoryPayload, "warehouse_id" | "product_variant_id"> }) =>
      inventoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_KEY })
  });
};

export const useDeleteInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_KEY })
  });
};
