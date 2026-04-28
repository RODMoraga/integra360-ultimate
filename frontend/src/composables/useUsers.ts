import { useQuery } from "@tanstack/vue-query";
import { api } from "../services/api";

/**
 * User row contract for users table rendering.
 */
export interface UserItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

/**
 * Query hook that retrieves users from API and caches by `users` key.
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<UserItem[]>("/users");
      return data;
    }
  });
};