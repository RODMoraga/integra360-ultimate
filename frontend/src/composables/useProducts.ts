import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { productApiService, ProductPayload } from "../services/product.service";

/**
 * Cache keys used by all product queries/mutations.
 */
export const PRODUCTS_KEY = ["products"] as const;
export const PRODUCT_UNITS_KEY = ["product-units"] as const;

/**
 * Query hook to retrieve products collection.
 */
export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: () => productApiService.list()
  });
};

/**
 * Query hook to retrieve active units of measure for product forms.
 */
export const useProductUnits = () => {
  return useQuery({
    queryKey: PRODUCT_UNITS_KEY,
    queryFn: () => productApiService.listUnits()
  });
};

/**
 * Mutation hook for product creation.
 * Invalidates product cache on success.
 */
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload & { sku: string; name: string; base_uom_id: number }) =>
      productApiService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
  });
};

/**
 * Mutation hook for product updates.
 * Invalidates product cache on success.
 */
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      productApiService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
  });
};

/**
 * Mutation hook for product soft-delete.
 * Invalidates product cache on success.
 */
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productApiService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
  });
};
