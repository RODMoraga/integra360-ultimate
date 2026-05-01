import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { communeService, CommunePayload } from "../services/commune.service";

/**
 * Cache key used by all commune queries/mutations.
 */
export const COMMUNES_KEY = ["communes"] as const;

/**
 * Query hook to retrieve communes collection.
 */
export const useCommunes = () => {
  return useQuery({
    queryKey: COMMUNES_KEY,
    queryFn: () => communeService.list()
  });
};

/**
 * Mutation hook for commune creation.
 * Invalidates commune cache on success.
 */
export const useCreateCommune = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunePayload & { city_id: number; code: string; name: string }) =>
      communeService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMMUNES_KEY })
  });
};

/**
 * Mutation hook for commune updates.
 * Invalidates commune cache on success.
 */
export const useUpdateCommune = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CommunePayload }) =>
      communeService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMMUNES_KEY })
  });
};

/**
 * Mutation hook for commune deletion.
 * Invalidates commune cache on success.
 */
export const useDeleteCommune = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communeService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMMUNES_KEY })
  });
};
