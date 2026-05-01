import { api } from "./api";

/**
 * DTO returned by the products API.
 */
export interface ProductItem {
  id: string;
  company_id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  category_code: string | null;
  subcategory_id: string | null;
  subcategory_name: string | null;
  brand_id: string | null;
  brand_name: string | null;
  brand_code: string | null;
  model_id: string | null;
  model_name: string | null;
  base_uom_id: string;
  uom_code: string | null;
  uom_name: string | null;
  uom_symbol: string | null;
  tax_rate: number;
  cost_price: number;
  sale_price: number;
  min_price: number | null;
  is_featured: boolean;
  track_inventory: boolean;
  min_stock: number;
  is_service: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for unit of measure selector options.
 */
export interface ProductUomOption {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

/**
 * Payload accepted by create/update product endpoints.
 */
export interface ProductPayload {
  sku?: string;
  barcode?: string | null;
  name?: string;
  description?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  brand_id?: number | null;
  model_id?: number | null;
  base_uom_id?: number;
  tax_rate?: number;
  cost_price?: number;
  sale_price?: number;
  min_price?: number | null;
  is_featured?: boolean;
  track_inventory?: boolean;
  min_stock?: number;
  is_service?: boolean;
  is_active?: boolean;
}

/**
 * Client service for product endpoints.
 */
export const productApiService = {
  async list(): Promise<ProductItem[]> {
    const { data } = await api.get<ProductItem[]>("/products");
    return data;
  },

  async listUnits(): Promise<ProductUomOption[]> {
    const { data } = await api.get<ProductUomOption[]>("/products/units");
    return data;
  },

  async getById(id: string): Promise<ProductItem> {
    const { data } = await api.get<ProductItem>(`/products/${id}`);
    return data;
  },

  async create(payload: ProductPayload & { sku: string; name: string; base_uom_id: number }): Promise<ProductItem> {
    const { data } = await api.post<ProductItem>("/products", payload);
    return data;
  },

  async update(id: string, payload: ProductPayload): Promise<ProductItem> {
    const { data } = await api.put<ProductItem>(`/products/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
