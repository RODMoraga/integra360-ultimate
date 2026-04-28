import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { companyService, CompanyPayload } from "../services/company.service";

/**
 * Cache key used by all company queries/mutations.
 */
export const COMPANIES_KEY = ["companies"] as const;

/**
 * Query hook to retrieve companies collection.
 */
export const useCompanies = () => {
  return useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: () => companyService.list()
  });
};

/**
 * Mutation hook for company creation.
 * Invalidates company cache on success.
 */
export const useCreateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyPayload & { code: string; tax_id: string }) =>
      companyService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMPANIES_KEY })
  });
};

/**
 * Mutation hook for company updates.
 * Invalidates company cache on success.
 */
export const useUpdateCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompanyPayload }) =>
      companyService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMPANIES_KEY })
  });
};

/**
 * Mutation hook for company soft-delete.
 * Invalidates company cache on success.
 */
export const useDeleteCompany = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMPANIES_KEY })
  });
};
