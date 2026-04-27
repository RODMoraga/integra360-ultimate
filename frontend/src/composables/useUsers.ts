import { useQuery } from "@tanstack/vue-query";
import { api } from "../services/api";

export interface UserItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<UserItem[]>("/users");
      return data;
    }
  });
};