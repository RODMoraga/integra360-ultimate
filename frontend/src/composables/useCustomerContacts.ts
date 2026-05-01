import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { customerContactService, CustomerContactPayload } from "../services/customer-contact.service";

/**
 * Cache key used by all customer contact queries/mutations.
 */
export const CUSTOMER_CONTACTS_KEY = ["customer-contacts"] as const;

/**
 * Query hook to retrieve the customer contacts collection.
 */
export const useCustomerContacts = () => {
  return useQuery({
    queryKey: CUSTOMER_CONTACTS_KEY,
    queryFn: () => customerContactService.list()
  });
};

/**
 * Mutation hook for contact creation.
 * Invalidates customer contacts cache on success.
 */
export const useCreateCustomerContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerContactPayload & { customer_id: number; full_name: string }) =>
      customerContactService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMER_CONTACTS_KEY })
  });
};

/**
 * Mutation hook for contact updates.
 * Invalidates customer contacts cache on success.
 */
export const useUpdateCustomerContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerContactPayload }) =>
      customerContactService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMER_CONTACTS_KEY })
  });
};

/**
 * Mutation hook for contact soft-delete.
 * Invalidates customer contacts cache on success.
 */
export const useDeleteCustomerContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerContactService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMER_CONTACTS_KEY })
  });
};
