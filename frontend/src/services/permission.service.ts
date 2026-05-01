import { api } from "./api";

/**
 * DTO returned by the permissions API.
 */
export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module_name: string;
  description: string | null;
  roles_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update permission endpoints.
 */
export interface PermissionPayload {
  code?: string;
  name?: string;
  module_name?: string;
  description?: string;
}

/**
 * Client service for permission endpoints.
 */
export const permissionService = {
  /**
   * Retrieves all permissions.
   */
  async list(): Promise<PermissionItem[]> {
    const { data } = await api.get<PermissionItem[]>("/permissions");
    return data;
  },

  /**
   * Retrieves one permission by id.
   */
  async getById(id: string): Promise<PermissionItem> {
    const { data } = await api.get<PermissionItem>(`/permissions/${id}`);
    return data;
  },

  /**
   * Creates one permission.
   */
  async create(payload: PermissionPayload & { code: string; name: string; module_name: string }): Promise<PermissionItem> {
    const { data } = await api.post<PermissionItem>("/permissions", payload);
    return data;
  },

  /**
   * Updates one permission.
   */
  async update(id: string, payload: PermissionPayload): Promise<PermissionItem> {
    const { data } = await api.put<PermissionItem>(`/permissions/${id}`, payload);
    return data;
  },

  /**
   * Deletes one permission.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/permissions/${id}`);
  }
};
