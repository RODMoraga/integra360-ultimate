import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { subcategoryService, SubcategoryPayload } from "../services/subcategory.service";

/**
 * Cache key used by all subcategory queries/mutations.
 */
export const SUBCATEGORIES_KEY = ["subcategories"] as const;

/**
 * Query hook to retrieve subcategories collection.
 */
export const useSubcategories = () => {
  return useQuery({
    queryKey: SUBCATEGORIES_KEY,
    queryFn: () => subcategoryService.list()
  });
};

/**
 * Mutation hook for subcategory creation.
 * Invalidates subcategory cache on success.
 */
export const useCreateSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubcategoryPayload & { category_id: number; code: string; name: string }) =>
      subcategoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUBCATEGORIES_KEY })
  });
};

/**
 * Mutation hook for subcategory updates.
 * Invalidates subcategory cache on success.
 */
export const useUpdateSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubcategoryPayload }) =>
      subcategoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUBCATEGORIES_KEY })
  });
};

/**
 * Mutation hook for subcategory soft-delete.
 * Invalidates subcategory cache on success.
 */
export const useDeleteSubcategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subcategoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SUBCATEGORIES_KEY })
  });
};