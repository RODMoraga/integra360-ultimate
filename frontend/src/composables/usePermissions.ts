import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { permissionService, type PermissionPayload } from "../services/permission.service";

/**
 * Cache key for permissions collection.
 */
export const PERMISSIONS_KEY = ["permissions"] as const;

/**
 * Query hook to retrieve permissions.
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: () => permissionService.list()
  });
};

/**
 * Mutation hook for permission creation.
 */
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PermissionPayload & { code: string; name: string; module_name: string }) =>
      permissionService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY })
  });
};

/**
 * Mutation hook for permission updates.
 */
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PermissionPayload }) =>
      permissionService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY })
  });
};

/**
 * Mutation hook for permission deletion.
 */
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY })
  });
};
