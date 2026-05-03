import { api } from "./api";

/**
 * User role option returned by users API.
 */
export interface UserRoleItem {
  id: string;
  code: string;
  name: string;
}

/**
 * User row contract returned by users API.
 */
export interface UserItem {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  role_ids: string[];
  role_names: string[];
  primary_role: string;
  roles: UserRoleItem[];
}

/**
 * Payload accepted by create/update users endpoints.
 */
export interface UserPayload {
  full_name?: string;
  email?: string;
  password?: string;
  role_ids?: number[];
  is_active?: boolean;
}

/**
 * Payload for authenticated user's profile update.
 */
export interface UpdateMyProfilePayload {
  full_name?: string;
  email?: string;
}

/**
 * Payload for authenticated user password rotation endpoint.
 */
export interface UpdateMyPasswordPayload {
  current_password: string;
  new_password: string;
}

/**
 * Single audit log entry returned by GET /users/me/audit.
 */
export interface AuditEntry {
  id: string;
  changed_at: string;
  changed_by: string;
  changed_fields: string[];
  old_data: { full_name?: string; email?: string };
  new_data: { full_name?: string; email?: string };
  ip_address: string | null;
  user_agent: string | null;
}

/**
 * Client service for users endpoints.
 */
export const userService = {
  /**
   * Retrieves currently authenticated user profile.
   */
  async getMe(): Promise<UserItem> {
    const { data } = await api.get<UserItem>("/users/me");
    return data;
  },

  /**
   * Updates currently authenticated user profile.
   */
  async updateMe(payload: UpdateMyProfilePayload): Promise<UserItem> {
    const { data } = await api.patch<UserItem>("/users/me", payload);
    return data;
  },

  /**
   * Retrieves users collection.
   */
  async list(): Promise<UserItem[]> {
    const { data } = await api.get<UserItem[]>("/users");
    return data;
  },

  /**
   * Retrieves one user by id.
   */
  async getById(id: string): Promise<UserItem> {
    const { data } = await api.get<UserItem>(`/users/${id}`);
    return data;
  },

  /**
   * Retrieves company roles available for assignment.
   */
  async listRoles(): Promise<UserRoleItem[]> {
    try {
      const { data } = await api.get<UserRoleItem[]>("/users/roles");
      return data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404 || status === 500) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Creates a new user.
   */
  async create(payload: UserPayload & { full_name: string; email: string; password: string }): Promise<UserItem> {
    const { data } = await api.post<UserItem>("/users", payload);
    return data;
  },

  /**
   * Updates an existing user.
   */
  async update(id: string, payload: UserPayload): Promise<UserItem> {
    const { data } = await api.put<UserItem>(`/users/${id}`, payload);
    return data;
  },

  /**
   * Rotates password for the currently authenticated user.
   */
  async updateMyPassword(payload: UpdateMyPasswordPayload): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>("/users/me/password", payload);
    return data;
  },

  /**
   * Retrieves audit log entries for the currently authenticated user.
   */
  async getMyAudit(limit?: number): Promise<AuditEntry[]> {
    const params = limit !== undefined ? { limit } : {};
    const { data } = await api.get<AuditEntry[]>("/users/me/audit", { params });
    return data;
  },

  /**
   * Soft-deletes user by id.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};
