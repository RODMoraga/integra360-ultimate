import { computed, type MaybeRef, unref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  documentService,
  type DocumentListFilters,
  type DocumentPayload
} from "../services/document.service";

export const DOCUMENTS_KEY = ["documents"] as const;

export const useDocuments = (filters: MaybeRef<DocumentListFilters>) => {
  const normalizedFilters = computed(() => {
    const current = unref(filters);
    return {
      partner_name: current.partner_name?.trim() || undefined,
      status: current.status || undefined,
      date_from: current.date_from || undefined,
      date_to: current.date_to || undefined
    };
  });

  return useQuery({
    queryKey: computed(() => [...DOCUMENTS_KEY, normalizedFilters.value]),
    queryFn: () => documentService.list(normalizedFilters.value)
  });
};

export const useCreateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentPayload & { document_type_id: number; details: NonNullable<DocumentPayload["details"]> }) =>
      documentService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY })
  });
};

export const useUpdateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DocumentPayload }) =>
      documentService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY })
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY })
  });
};
