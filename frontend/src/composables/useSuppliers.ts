import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { supplierService, SupplierPayload } from "../services/supplier.service";

/**
 * Cache key used by all supplier queries/mutations.
 */
export const SUPPLIERS_KEY = ["suppliers"] as const;

/**
 * Query hook to retrieve suppliers collection.
 */
export const useSuppliers = () => {
  return useQuery({
    queryKey: SUPPLIERS_KEY,
    queryFn: () => supplierService.list()
  });
};

/**
 * Mutation hook for supplier creation.
 * Invalidates supplier cache on success.
 */
export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload & { code: string; legal_name: string }) =>
      supplierService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIERS_KEY })
  });
};

/**
 * Mutation hook for supplier updates.
 * Invalidates supplier cache on success.
 */
export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupplierPayload }) =>
      supplierService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIERS_KEY })
  });
};

/**
 * Mutation hook for supplier soft-delete.
 * Invalidates supplier cache on success.
 */
export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIERS_KEY })
  });
};

