import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, unref, type MaybeRef } from "vue";
import {
  inventoryMovementService,
  type InventoryMovementListParams,
  type InventoryMovementPayload
} from "../services/inventoryMovement.service";

export const INVENTORY_MOVEMENTS_KEY = ["inventory-movements"] as const;

export const useInventoryMovements = (params?: MaybeRef<InventoryMovementListParams | undefined>) => {
  const normalizedParams = computed(() => unref(params) ?? {});

  return useQuery({
    queryKey: computed(() => [...INVENTORY_MOVEMENTS_KEY, normalizedParams.value]),
    queryFn: () => inventoryMovementService.list(normalizedParams.value)
  });
};

export const useCreateInventoryMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: InventoryMovementPayload & {
        movement_type_id: number;
        warehouse_id: number;
        product_variant_id: number;
        quantity: number;
      }
    ) => inventoryMovementService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_MOVEMENTS_KEY })
  });
};

export const useUpdateInventoryMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InventoryMovementPayload }) =>
      inventoryMovementService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_MOVEMENTS_KEY })
  });
};

export const useDeleteInventoryMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryMovementService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_MOVEMENTS_KEY })
  });
};
