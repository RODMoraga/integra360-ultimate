import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { cityService, CityPayload } from "../services/city.service";

/**
 * Cache key used by all city queries/mutations.
 */
export const CITIES_KEY = ["cities"] as const;

/**
 * Query hook to retrieve cities collection.
 */
export const useCities = () => {
  return useQuery({
    queryKey: CITIES_KEY,
    queryFn: () => cityService.list()
  });
};

/**
 * Mutation hook for city creation.
 * Invalidates city cache on success.
 */
export const useCreateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CityPayload & { region_id: number; code: string; name: string }) =>
      cityService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CITIES_KEY })
  });
};

/**
 * Mutation hook for city updates.
 * Invalidates city cache on success.
 */
export const useUpdateCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CityPayload }) =>
      cityService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CITIES_KEY })
  });
};

/**
 * Mutation hook for city deletion.
 * Invalidates city cache on success.
 */
export const useDeleteCity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cityService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CITIES_KEY })
  });
};
