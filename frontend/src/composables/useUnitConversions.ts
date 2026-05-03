import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  unitConversionService,
  UnitConversionPayload
} from "../services/unit-conversion.service";

/**
 * Cache key used by all unit-conversion queries/mutations.
 */
export const UNIT_CONVERSIONS_KEY = ["unit-conversions"] as const;

/**
 * Query hook to retrieve the conversions collection.
 */
export const useUnitConversions = () => {
  return useQuery({
    queryKey: UNIT_CONVERSIONS_KEY,
    queryFn: () => unitConversionService.list()
  });
};

/**
 * Mutation hook for conversion creation.
 * Invalidates cache on success.
 */
export const useCreateUnitConversion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnitConversionPayload & { from_unit_id: number; to_unit_id: number; factor: number }) =>
      unitConversionService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_CONVERSIONS_KEY })
  });
};

/**
 * Mutation hook for conversion updates.
 * Invalidates cache on success.
 */
export const useUpdateUnitConversion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UnitConversionPayload }) =>
      unitConversionService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_CONVERSIONS_KEY })
  });
};

/**
 * Mutation hook for conversion delete.
 * Invalidates cache on success.
 */
export const useDeleteUnitConversion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitConversionService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_CONVERSIONS_KEY })
  });
};
