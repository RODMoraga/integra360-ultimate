import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { customerService, CustomerPayload } from "../services/customer.service";

/**
 * Cache key used by all customer queries/mutations.
 */
export const CUSTOMERS_KEY = ["customers"] as const;

/**
 * Query hook to retrieve customers collection.
 */
export const useCustomers = () => {
  return useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: () => customerService.list()
  });
};

/**
 * Mutation hook for customer creation.
 * Invalidates customer cache on success.
 */
export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerPayload & { code: string; legal_name: string }) =>
      customerService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMERS_KEY })
  });
};

/**
 * Mutation hook for customer updates.
 * Invalidates customer cache on success.
 */
export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerPayload }) =>
      customerService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMERS_KEY })
  });
};

/**
 * Mutation hook for customer soft-delete.
 * Invalidates customer cache on success.
 */
export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMERS_KEY })
  });
};
