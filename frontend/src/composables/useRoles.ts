import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { roleService, type RolePayload } from "../services/role.service";

/**
 * Cache key for role collection.
 */
export const ROLES_KEY = ["roles"] as const;

/**
 * Cache key for role permissions catalog.
 */
export const ROLE_PERMISSIONS_KEY = ["roles", "permissions"] as const;

/**
 * Query hook to retrieve roles.
 */
export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => roleService.list()
  });
};

/**
 * Query hook to retrieve permissions for role assignment.
 */
export const useRolePermissions = () => {
  return useQuery({
    queryKey: ROLE_PERMISSIONS_KEY,
    queryFn: () => roleService.listPermissions()
  });
};

/**
 * Mutation hook for role creation.
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePayload & { code: string; name: string }) => roleService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY })
  });
};

/**
 * Mutation hook for role updates.
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RolePayload }) => roleService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY })
  });
};

/**
 * Mutation hook for role soft-delete.
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_KEY })
  });
};
