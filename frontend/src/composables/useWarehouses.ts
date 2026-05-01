import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { warehouseService, WarehousePayload } from "../services/warehouse.service";

/**
 * Cache key used by all warehouse queries/mutations.
 */
export const WAREHOUSES_KEY = ["warehouses"] as const;

/**
 * Query hook to retrieve warehouses collection.
 */
export const useWarehouses = () => {
  return useQuery({
    queryKey: WAREHOUSES_KEY,
    queryFn: () => warehouseService.list()
  });
};

/**
 * Mutation hook for warehouse creation.
 * Invalidates warehouse cache on success.
 */
export const useCreateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehousePayload & { code: string; name: string }) =>
      warehouseService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: WAREHOUSES_KEY })
  });
};

/**
 * Mutation hook for warehouse updates.
 * Invalidates warehouse cache on success.
 */
export const useUpdateWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WarehousePayload }) =>
      warehouseService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: WAREHOUSES_KEY })
  });
};

/**
 * Mutation hook for warehouse soft-delete.
 * Invalidates warehouse cache on success.
 */
export const useDeleteWarehouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warehouseService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: WAREHOUSES_KEY })
  });
};
