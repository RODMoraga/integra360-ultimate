import { computed, unref, type MaybeRef } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  productImageService,
  ProductImageListFilters,
  ProductImagePayload
} from "../services/product-image.service";

export const PRODUCT_IMAGES_KEY = ["product-images"] as const;

export const useProductImages = (filters?: MaybeRef<ProductImageListFilters | undefined>) => {
  return useQuery({
    queryKey: computed(() => [PRODUCT_IMAGES_KEY[0], unref(filters)?.product_id ?? "all"] as const),
    queryFn: () => productImageService.list(unref(filters))
  });
};

export const useCreateProductImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductImagePayload & { product_id: string; image: File }) =>
      productImageService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_IMAGES_KEY })
  });
};

export const useUpdateProductImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductImagePayload }) =>
      productImageService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_IMAGES_KEY })
  });
};

export const useDeleteProductImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productImageService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_IMAGES_KEY })
  });
};
