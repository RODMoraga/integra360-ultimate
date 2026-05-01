import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  unitOfMeasureService,
  UnitOfMeasurePayload
} from "../services/unit-of-measure.service";

/**
 * Cache key used by all unit-of-measure queries/mutations.
 */
export const UNITS_OF_MEASURE_KEY = ["units-of-measure"] as const;

/**
 * Query hook to retrieve the units-of-measure collection.
 */
export const useUnitsOfMeasure = () => {
  return useQuery({
    queryKey: UNITS_OF_MEASURE_KEY,
    queryFn: () => unitOfMeasureService.list()
  });
};

/**
 * Mutation hook for unit creation.
 * Invalidates cache on success.
 */
export const useCreateUnitOfMeasure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: UnitOfMeasurePayload & {
        code: string;
        name: string;
        symbol: string;
        unit_type: string;
      }
    ) => unitOfMeasureService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNITS_OF_MEASURE_KEY })
  });
};

/**
 * Mutation hook for unit updates.
 * Invalidates cache on success.
 */
export const useUpdateUnitOfMeasure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UnitOfMeasurePayload }) =>
      unitOfMeasureService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNITS_OF_MEASURE_KEY })
  });
};

/**
 * Mutation hook for unit soft-delete.
 * Invalidates cache on success.
 */
export const useDeleteUnitOfMeasure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitOfMeasureService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNITS_OF_MEASURE_KEY })
  });
};
