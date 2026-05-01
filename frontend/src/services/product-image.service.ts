import { api } from "./api";

/**
 * DTO returned by the product-images API.
 */
export interface ProductImageItem {
  id: string;
  company_id: string;
  product_id: string;
  product_sku: string | null;
  product_name: string | null;
  asset_id: string;
  image_url: string | null;
  storage_key: string | null;
  original_filename: string | null;
  mime_type: string | null;
  extension: string | null;
  size_bytes: string | null;
  width_px: number | null;
  height_px: number | null;
  purpose: "PRIMARY" | "GALLERY" | "THUMBNAIL" | "DETAIL" | "PACKAGING";
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImageListFilters {
  product_id?: string;
}

export interface ProductImagePayload {
  product_id?: string;
  purpose?: "PRIMARY" | "GALLERY" | "THUMBNAIL" | "DETAIL" | "PACKAGING";
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
  is_active?: boolean;
  image?: File;
}

const appendIfPresent = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return;
  }

  formData.append(key, String(value));
};

const toFormData = (payload: ProductImagePayload) => {
  const fd = new FormData();
  appendIfPresent(fd, "product_id", payload.product_id);
  appendIfPresent(fd, "purpose", payload.purpose);
  appendIfPresent(fd, "alt_text", payload.alt_text);
  appendIfPresent(fd, "sort_order", payload.sort_order);

  if (payload.is_primary !== undefined) {
    fd.append("is_primary", payload.is_primary ? "true" : "false");
  }
  if (payload.is_active !== undefined) {
    fd.append("is_active", payload.is_active ? "true" : "false");
  }
  if (payload.image) {
    fd.append("image", payload.image);
  }

  return fd;
};

/**
 * Client service for product-images endpoints.
 */
export const productImageService = {
  async list(filters?: ProductImageListFilters): Promise<ProductImageItem[]> {
    const { data } = await api.get<ProductImageItem[]>("/product-images", {
      params: filters
    });
    return data;
  },

  async getById(id: string): Promise<ProductImageItem> {
    const { data } = await api.get<ProductImageItem>(`/product-images/${id}`);
    return data;
  },

  async create(payload: ProductImagePayload & { product_id: string; image: File }): Promise<ProductImageItem> {
    const { data } = await api.post<ProductImageItem>("/product-images", toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  async update(id: string, payload: ProductImagePayload): Promise<ProductImageItem> {
    const { data } = await api.put<ProductImageItem>(`/product-images/${id}`, toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/product-images/${id}`);
  }
};
