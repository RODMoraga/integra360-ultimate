import { describe, expect, it } from "vitest";

import {
  buildInventoryMovementsRouteQuery,
  normalizeInventoryMovementsQuery,
  type InventoryMovementsQueryState
} from "./inventoryMovementsQueryState";

describe("inventoryMovementsQueryState", () => {
  it("hydrates sorting and pagination from URL query", () => {
    const state = normalizeInventoryMovementsQuery({
      movement_type_id: "7",
      warehouse_id: "12",
      date_from: "2026-05-01",
      date_to: "2026-05-03",
      q: "transfer",
      page: "3",
      pageSize: "25",
      sortKey: "quantity",
      sortDirection: "asc"
    });

    expect(state.filters.movement_type_id).toBe("7");
    expect(state.filters.warehouse_id).toBe("12");
    expect(state.filters.date_from).toBe("2026-05-01");
    expect(state.filters.date_to).toBe("2026-05-03");
    expect(state.searchQuery).toBe("transfer");
    expect(state.page).toBe(3);
    expect(state.pageSize).toBe(25);
    expect(state.sortKey).toBe("quantity");
    expect(state.sortDirection).toBe("asc");
  });

  it("falls back to defaults for invalid sort query values", () => {
    const state = normalizeInventoryMovementsQuery({
      sortKey: "invalid-key",
      sortDirection: "up",
      pageSize: "13"
    });

    expect(state.sortKey).toBe("movement_date");
    expect(state.sortDirection).toBe("desc");
    expect(state.pageSize).toBe(10);
  });

  it("builds a compact shareable query omitting defaults", () => {
    const state: InventoryMovementsQueryState = {
      filters: {
        movement_type_id: "",
        warehouse_id: "",
        date_from: "",
        date_to: ""
      },
      searchQuery: "",
      page: 1,
      pageSize: 10,
      sortKey: "movement_date",
      sortDirection: "desc"
    };

    const query = buildInventoryMovementsRouteQuery(state);

    expect(query).toEqual({
      movement_type_id: undefined,
      warehouse_id: undefined,
      date_from: undefined,
      date_to: undefined,
      q: undefined,
      page: undefined,
      pageSize: undefined,
      sortKey: undefined,
      sortDirection: undefined
    });
  });

  it("builds query including explicit non-default sorting for share links", () => {
    const state: InventoryMovementsQueryState = {
      filters: {
        movement_type_id: "2",
        warehouse_id: "9",
        date_from: "",
        date_to: ""
      },
      searchQuery: "entrada",
      page: 2,
      pageSize: 25,
      sortKey: "quantity",
      sortDirection: "asc"
    };

    const query = buildInventoryMovementsRouteQuery(state);

    expect(query).toEqual({
      movement_type_id: "2",
      warehouse_id: "9",
      date_from: undefined,
      date_to: undefined,
      q: "entrada",
      page: "2",
      pageSize: "25",
      sortKey: "quantity",
      sortDirection: "asc"
    });
  });
});
