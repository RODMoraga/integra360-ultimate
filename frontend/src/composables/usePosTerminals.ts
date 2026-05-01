import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { posTerminalService, PosTerminalPayload } from "../services/pos-terminal.service";

/**
 * Cache key used by all POS terminal queries/mutations.
 */
export const POS_TERMINALS_KEY = ["pos-terminals"] as const;

/**
 * Query hook to retrieve POS terminals collection.
 */
export const usePosTerminals = () => {
  return useQuery({
    queryKey: POS_TERMINALS_KEY,
    queryFn: () => posTerminalService.list()
  });
};

/**
 * Mutation hook for POS terminal creation.
 * Invalidates POS terminal cache on success.
 */
export const useCreatePosTerminal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PosTerminalPayload & { warehouse_id: number; code: string; name: string }) =>
      posTerminalService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: POS_TERMINALS_KEY })
  });
};

/**
 * Mutation hook for POS terminal updates.
 * Invalidates POS terminal cache on success.
 */
export const useUpdatePosTerminal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PosTerminalPayload }) =>
      posTerminalService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: POS_TERMINALS_KEY })
  });
};

/**
 * Mutation hook for POS terminal soft-delete.
 * Invalidates POS terminal cache on success.
 */
export const useDeletePosTerminal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => posTerminalService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: POS_TERMINALS_KEY })
  });
};
