import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  fetchSupplierContacts,
  createSupplierContact,
  updateSupplierContact,
  deleteSupplierContact,
  SupplierContactPayload
} from "../services/supplier-contact.service";

/**
 * Cache key used by all supplier contact queries/mutations.
 */
export const SUPPLIER_CONTACTS_KEY = ["supplier-contacts"] as const;

/**
 * Query hook to retrieve the supplier contacts collection.
 */
export const useSupplierContacts = () => {
  return useQuery({
    queryKey: SUPPLIER_CONTACTS_KEY,
    queryFn: () => fetchSupplierContacts()
  });
};

/**
 * Mutation hook for contact creation.
 * Invalidates supplier contacts cache on success.
 */
export const useCreateSupplierContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierContactPayload & { supplier_id: number; full_name: string }) =>
      createSupplierContact(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIER_CONTACTS_KEY })
  });
};

/**
 * Mutation hook for contact updates.
 * Invalidates supplier contacts cache on success.
 */
export const useUpdateSupplierContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupplierContactPayload }) =>
      updateSupplierContact(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIER_CONTACTS_KEY })
  });
};

/**
 * Mutation hook for contact soft-delete.
 * Invalidates supplier contacts cache on success.
 */
export const useDeleteSupplierContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplierContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUPPLIER_CONTACTS_KEY })
  });
};
