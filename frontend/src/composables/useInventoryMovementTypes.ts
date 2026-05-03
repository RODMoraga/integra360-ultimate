import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  inventoryMovementTypeService,
  type InventoryMovementTypePayload
} from "../services/inventoryMovementType.service";

export const INVENTORY_MOVEMENT_TYPES_KEY = ["inventory-movement-types"] as const;

export const useInventoryMovementTypes = () => {
  return useQuery({
    queryKey: INVENTORY_MOVEMENT_TYPES_KEY,
    queryFn: () => inventoryMovementTypeService.list()
  });
};

export const useCreateInventoryMovementType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Required<Pick<InventoryMovementTypePayload, "code" | "name" | "direction">>) =>
      inventoryMovementTypeService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_TYPES_KEY })
  });
};

export const useUpdateInventoryMovementType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InventoryMovementTypePayload }) =>
      inventoryMovementTypeService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_TYPES_KEY })
  });
};

export const useDeleteInventoryMovementType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryMovementTypeService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_MOVEMENT_TYPES_KEY })
  });
};