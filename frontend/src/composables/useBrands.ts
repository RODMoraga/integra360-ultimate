import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { brandService, BrandPayload } from "../services/brand.service";

/**
 * Cache key used by all brand queries/mutations.
 */
export const BRANDS_KEY = ["brands"] as const;

/**
 * Query hook to retrieve brands collection.
 */
export const useBrands = () => {
  return useQuery({
    queryKey: BRANDS_KEY,
    queryFn: () => brandService.list()
  });
};

/**
 * Mutation hook for brand creation.
 * Invalidates brand cache on success.
 */
export const useCreateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrandPayload & { code: string; name: string }) =>
      brandService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY })
  });
};

/**
 * Mutation hook for brand updates.
 * Invalidates brand cache on success.
 */
export const useUpdateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BrandPayload }) =>
      brandService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY })
  });
};

/**
 * Mutation hook for brand soft-delete.
 * Invalidates brand cache on success.
 */
export const useDeleteBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY })
  });
};
