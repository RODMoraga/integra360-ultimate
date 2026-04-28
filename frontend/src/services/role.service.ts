import { api } from "./api";

/**
 * Permission option returned by roles endpoints.
 */
export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module_name: string;
  description: string | null;
}

/**
 * Role row contract returned by roles API.
 */
export interface RoleItem {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  users_count: number;
  permission_ids: string[];
  permission_codes: string[];
  permissions: Array<{
    id: string;
    code: string;
    name: string;
    module_name: string;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * Payload accepted by create/update role endpoints.
 */
export interface RolePayload {
  code?: string;
  name?: string;
  description?: string;
  permission_ids?: number[];
}

/**
 * Client service for role endpoints.
 */
export const roleService = {
  /**
   * Retrieves roles collection.
   */
  async list(): Promise<RoleItem[]> {
    const { data } = await api.get<RoleItem[]>("/roles");
    return data;
  },

  /**
   * Retrieves one role by id.
   */
  async getById(id: string): Promise<RoleItem> {
    const { data } = await api.get<RoleItem>(`/roles/${id}`);
    return data;
  },

  /**
   * Retrieves permissions catalog.
   */
  async listPermissions(): Promise<PermissionItem[]> {
    const { data } = await api.get<PermissionItem[]>("/roles/permissions");
    return data;
  },

  /**
   * Creates one role.
   */
  async create(payload: RolePayload & { code: string; name: string }): Promise<RoleItem> {
    const { data } = await api.post<RoleItem>("/roles", payload);
    return data;
  },

  /**
   * Updates one role.
   */
  async update(id: string, payload: RolePayload): Promise<RoleItem> {
    const { data } = await api.put<RoleItem>(`/roles/${id}`, payload);
    return data;
  },

  /**
   * Soft-deletes one role.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  }
};
