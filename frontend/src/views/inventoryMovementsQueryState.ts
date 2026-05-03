import type { LocationQuery } from "vue-router";

export type SortKey = "id" | "movement_date" | "movement_type_name" | "warehouse_name" | "product_name" | "quantity" | "unit_cost";
export type SortDirection = "asc" | "desc";

export type InventoryMovementsFilters = {
  movement_type_id: string;
  warehouse_id: string;
  date_from: string;
  date_to: string;
};

export type InventoryMovementsQueryState = {
  filters: InventoryMovementsFilters;
  searchQuery: string;
  page: number;
  pageSize: number;
  sortKey: SortKey;
  sortDirection: SortDirection;
};

export const allowedSortKeys = ["id", "movement_date", "movement_type_name", "warehouse_name", "product_name", "quantity", "unit_cost"] as const;
export const allowedSortDirections = ["asc", "desc"] as const;
export const pageSizeAllowedValues = [5, 10, 25, 50] as const;

export const DEFAULT_SORT_KEY: SortKey = "movement_date";
export const DEFAULT_SORT_DIRECTION: SortDirection = "desc";
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

function queryValueToString(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }
  return typeof value === "string" ? value : "";
}

function queryValueToPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(queryValueToString(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function queryValueToAllowedInt(value: unknown, allowed: readonly number[], fallback: number): number {
  const parsed = queryValueToPositiveInt(value, fallback);
  return allowed.includes(parsed) ? parsed : fallback;
}

function queryValueToAllowedString<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const parsed = queryValueToString(value) as T;
  return allowed.includes(parsed) ? parsed : fallback;
}

export function normalizeInventoryMovementsQuery(query: LocationQuery): InventoryMovementsQueryState {
  return {
    filters: {
      movement_type_id: queryValueToString(query.movement_type_id),
      warehouse_id: queryValueToString(query.warehouse_id),
      date_from: queryValueToString(query.date_from),
      date_to: queryValueToString(query.date_to)
    },
    searchQuery: queryValueToString(query.q),
    page: queryValueToPositiveInt(query.page, DEFAULT_PAGE),
    pageSize: queryValueToAllowedInt(query.pageSize, pageSizeAllowedValues, DEFAULT_PAGE_SIZE),
    sortKey: queryValueToAllowedString(query.sortKey, allowedSortKeys, DEFAULT_SORT_KEY),
    sortDirection: queryValueToAllowedString(query.sortDirection, allowedSortDirections, DEFAULT_SORT_DIRECTION)
  };
}

export function buildInventoryMovementsRouteQuery(state: InventoryMovementsQueryState): Record<string, string | undefined> {
  return {
    movement_type_id: state.filters.movement_type_id || undefined,
    warehouse_id: state.filters.warehouse_id || undefined,
    date_from: state.filters.date_from || undefined,
    date_to: state.filters.date_to || undefined,
    q: state.searchQuery.trim() || undefined,
    page: state.page > DEFAULT_PAGE ? String(state.page) : undefined,
    pageSize: state.pageSize !== DEFAULT_PAGE_SIZE ? String(state.pageSize) : undefined,
    sortKey: state.sortKey !== DEFAULT_SORT_KEY ? state.sortKey : undefined,
    sortDirection: state.sortDirection !== DEFAULT_SORT_DIRECTION ? state.sortDirection : undefined
  };
}
