import { computed, type MaybeRef, unref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  saleService,
  type SaleListFilters,
  type SalePayload
} from "../services/sale.service";

export const SALES_KEY = ["sales"] as const;

export const useSales = (filters: MaybeRef<SaleListFilters>) => {
  const normalizedFilters = computed(() => {
    const current = unref(filters);
    return {
      partner_name: current.partner_name?.trim() || undefined,
      status: current.status || undefined,
      date_from: current.date_from || undefined,
      date_to: current.date_to || undefined
    };
  });

  return useQuery({
    queryKey: computed(() => [...SALES_KEY, normalizedFilters.value]),
    queryFn: () => saleService.list(normalizedFilters.value)
  });
};

export const useCreateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalePayload & { document_type_id: number; details: NonNullable<SalePayload["details"]> }) =>
      saleService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SALES_KEY })
  });
};

export const useUpdateSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SalePayload }) =>
      saleService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SALES_KEY })
  });
};

export const useDeleteSale = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => saleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SALES_KEY })
  });
};
