import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { documentTypeService, type DocumentTypePayload } from "../services/document-type.service";

/**
 * Cache key for document types collection.
 */
export const DOCUMENT_TYPES_KEY = ["document-types"] as const;

/**
 * Query hook to retrieve document types.
 */
export const useDocumentTypes = () => {
  return useQuery({
    queryKey: DOCUMENT_TYPES_KEY,
    queryFn: () => documentTypeService.list()
  });
};

/**
 * Mutation hook for document type creation.
 */
export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentTypePayload & { code: string; name: string }) =>
      documentTypeService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPES_KEY })
  });
};

/**
 * Mutation hook for document type updates.
 */
export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DocumentTypePayload }) =>
      documentTypeService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPES_KEY })
  });
};

/**
 * Mutation hook for document type deletion.
 */
export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentTypeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPES_KEY })
  });
};
