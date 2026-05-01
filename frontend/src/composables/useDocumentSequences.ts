import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { documentSequenceService, type DocumentSequencePayload } from "../services/document-sequence.service";

/**
 * Cache key for document sequences collection.
 */
export const DOCUMENT_SEQUENCES_KEY = ["document-sequences"] as const;

/**
 * Query hook to retrieve document sequences.
 */
export const useDocumentSequences = () => {
  return useQuery({
    queryKey: DOCUMENT_SEQUENCES_KEY,
    queryFn: () => documentSequenceService.list()
  });
};

/**
 * Mutation hook for sequence creation.
 */
export const useCreateDocumentSequence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Required<Pick<DocumentSequencePayload, "document_type_id" | "year_num" | "next_number">> & DocumentSequencePayload) =>
      documentSequenceService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENT_SEQUENCES_KEY })
  });
};

/**
 * Mutation hook for sequence updates.
 */
export const useUpdateDocumentSequence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DocumentSequencePayload }) =>
      documentSequenceService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENT_SEQUENCES_KEY })
  });
};

/**
 * Mutation hook for sequence deletion.
 */
export const useDeleteDocumentSequence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentSequenceService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENT_SEQUENCES_KEY })
  });
};
