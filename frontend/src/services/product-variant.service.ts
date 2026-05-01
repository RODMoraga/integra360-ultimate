import { api } from "./api";

/**
 * DTO returned by the product variants API.
 */
export interface ProductVariantItem {
  id: string;
  company_id: string;
  product_id: string;
  product_sku: string | null;
  product_name: string | null;
  variant_code: string;
  name: string;
  attributes_json: unknown | null;
  sku: string | null;
  barcode: string | null;
  cost_price: number;
  sale_price: number;
  is_active: boolean;
  document_details_count: number;
  inventory_count: number;
  inventory_movements_count: number;
  sale_details_count: number;
  dependencies_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for product selector options in variants forms.
 */
export interface ProductVariantProductOption {
  id: string;
  sku: string;
  name: string;
}

/**
 * Payload accepted by create/update product variant endpoints.
 */
export interface ProductVariantPayload {
  product_id?: number;
  variant_code?: string;
  name?: string;
  attributes_json?: unknown | null;
  sku?: string | null;
  barcode?: string | null;
  cost_price?: number;
  sale_price?: number;
  is_active?: boolean;
}

/**
 * Client service for product variant endpoints.
 */
export const productVariantService = {
  async list(): Promise<ProductVariantItem[]> {
    const { data } = await api.get<ProductVariantItem[]>("/product-variants");
    return data;
  },

  async listProducts(): Promise<ProductVariantProductOption[]> {
    const { data } = await api.get<ProductVariantProductOption[]>("/product-variants/products");
    return data;
  },

  async getById(id: string): Promise<ProductVariantItem> {
    const { data } = await api.get<ProductVariantItem>(`/product-variants/${id}`);
    return data;
  },

  async create(payload: ProductVariantPayload & { product_id: number; variant_code: string; name: string }): Promise<ProductVariantItem> {
    const { data } = await api.post<ProductVariantItem>("/product-variants", payload);
    return data;
  },

  async update(id: string, payload: ProductVariantPayload): Promise<ProductVariantItem> {
    const { data } = await api.put<ProductVariantItem>(`/product-variants/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/product-variants/${id}`);
  }
};
