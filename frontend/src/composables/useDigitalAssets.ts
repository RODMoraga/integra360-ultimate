import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { digitalAssetService, type DigitalAssetPayload } from "../services/digital-asset.service";

/**
 * Cache key for digital assets collection.
 */
export const DIGITAL_ASSETS_KEY = ["digital-assets"] as const;

/**
 * Query hook to retrieve digital assets.
 */
export const useDigitalAssets = () => {
  return useQuery({
    queryKey: DIGITAL_ASSETS_KEY,
    queryFn: () => digitalAssetService.list()
  });
};

/**
 * Mutation hook for digital asset creation.
 */
export const useCreateDigitalAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Required<Pick<DigitalAssetPayload, "storage_key" | "mime_type" | "size_bytes">> & DigitalAssetPayload) =>
      digitalAssetService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DIGITAL_ASSETS_KEY })
  });
};

/**
 * Mutation hook for digital asset updates.
 */
export const useUpdateDigitalAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DigitalAssetPayload }) =>
      digitalAssetService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DIGITAL_ASSETS_KEY })
  });
};

/**
 * Mutation hook for digital asset deletion.
 */
export const useDeleteDigitalAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => digitalAssetService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DIGITAL_ASSETS_KEY })
  });
};
