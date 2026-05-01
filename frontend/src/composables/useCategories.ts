import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { categoryService, CategoryPayload } from "../services/category.service";

/**
 * Cache key used by all category queries/mutations.
 */
export const CATEGORIES_KEY = ["categories"] as const;

/**
 * Query hook to retrieve categories collection.
 */
export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => categoryService.list()
  });
};

/**
 * Mutation hook for category creation.
 * Invalidates category cache on success.
 */
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload & { code: string; name: string }) =>
      categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
  });
};

/**
 * Mutation hook for category updates.
 * Invalidates category cache on success.
 */
export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      categoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
  });
};

/**
 * Mutation hook for category soft-delete.
 * Invalidates category cache on success.
 */
export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
  });
};