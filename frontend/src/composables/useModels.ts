import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { modelService, ModelPayload } from "../services/model.service";

/**
 * Cache key used by all model queries/mutations.
 */
export const MODELS_KEY = ["models"] as const;
export const MODELS_BRANDS_KEY = ["models-brands"] as const;

/**
 * Query hook to retrieve models collection.
 */
export const useModels = () => {
  return useQuery({
    queryKey: MODELS_KEY,
    queryFn: () => modelService.list()
  });
};

/**
 * Query hook to retrieve active brands for model forms.
 */
export const useModelBrands = () => {
  return useQuery({
    queryKey: MODELS_BRANDS_KEY,
    queryFn: () => modelService.listBrands()
  });
};

/**
 * Mutation hook for model creation.
 * Invalidates model cache on success.
 */
export const useCreateModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ModelPayload & { brand_id: number; code: string; name: string }) =>
      modelService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: MODELS_KEY })
  });
};

/**
 * Mutation hook for model updates.
 * Invalidates model cache on success.
 */
export const useUpdateModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ModelPayload }) =>
      modelService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: MODELS_KEY })
  });
};

/**
 * Mutation hook for model soft-delete.
 * Invalidates model cache on success.
 */
export const useDeleteModel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modelService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MODELS_KEY })
  });
};