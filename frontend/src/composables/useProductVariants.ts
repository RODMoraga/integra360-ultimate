import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { productVariantService, ProductVariantPayload } from "../services/product-variant.service";

/**
 * Cache keys used by product variant queries/mutations.
 */
export const PRODUCT_VARIANTS_KEY = ["product-variants"] as const;
export const PRODUCT_VARIANTS_PRODUCTS_KEY = ["product-variants-products"] as const;

/**
 * Query hook to retrieve product variants collection.
 */
export const useProductVariants = () => {
  return useQuery({
    queryKey: PRODUCT_VARIANTS_KEY,
    queryFn: () => productVariantService.list()
  });
};

/**
 * Query hook to retrieve active products for variant forms.
 */
export const useProductVariantProducts = () => {
  return useQuery({
    queryKey: PRODUCT_VARIANTS_PRODUCTS_KEY,
    queryFn: () => productVariantService.listProducts()
  });
};

/**
 * Mutation hook for product variant creation.
 * Invalidates variant cache on success.
 */
export const useCreateProductVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductVariantPayload & { product_id: number; variant_code: string; name: string }) =>
      productVariantService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_VARIANTS_KEY })
  });
};

/**
 * Mutation hook for product variant updates.
 * Invalidates variant cache on success.
 */
export const useUpdateProductVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductVariantPayload }) =>
      productVariantService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_VARIANTS_KEY })
  });
};

/**
 * Mutation hook for product variant soft-delete.
 * Invalidates variant cache on success.
 */
export const useDeleteProductVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productVariantService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_VARIANTS_KEY })
  });
};
