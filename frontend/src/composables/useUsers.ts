import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { userService, type UserPayload } from "../services/user.service";

/**
 * Cache key used by users queries and mutations.
 */
export const USERS_KEY = ["users"] as const;

/**
 * Cache key used by roles catalog queries.
 */
export const USER_ROLES_KEY = ["users", "roles"] as const;

/**
 * Query hook that retrieves users collection.
 */
export const useUsers = () => {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => userService.list()
  });
};

/**
 * Query hook that retrieves available role options for users.
 */
export const useUserRoles = () => {
  return useQuery({
    queryKey: USER_ROLES_KEY,
    queryFn: () => userService.listRoles()
  });
};

/**
 * Mutation hook for creating users.
 */
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload & { full_name: string; email: string; password: string }) =>
      userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY })
  });
};

/**
 * Mutation hook for updating users.
 */
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserPayload }) =>
      userService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY })
  });
};

/**
 * Mutation hook for soft-deleting users.
 */
export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY })
  });
};