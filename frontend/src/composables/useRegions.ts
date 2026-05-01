import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { regionService, RegionPayload } from "../services/region.service";

/**
 * Cache key used by all region queries/mutations.
 */
export const REGIONS_KEY = ["regions"] as const;

/**
 * Query hook to retrieve regions collection.
 */
export const useRegions = () => {
  return useQuery({
    queryKey: REGIONS_KEY,
    queryFn: () => regionService.list()
  });
};

/**
 * Mutation hook for region creation.
 * Invalidates region cache on success.
 */
export const useCreateRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegionPayload & { code: string; country_code: string; name: string }) =>
      regionService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY })
  });
};

/**
 * Mutation hook for region updates.
 * Invalidates region cache on success.
 */
export const useUpdateRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RegionPayload }) =>
      regionService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY })
  });
};

/**
 * Mutation hook for region deletion.
 * Invalidates region cache on success.
 */
export const useDeleteRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => regionService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: REGIONS_KEY })
  });
};
