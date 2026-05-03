/**
 * Inventory Movements Module - E2E Smoke Test
 *
 * Coverage:
 * - Valid movement creation for IN / OUT / TRANSFER
 * - Invalid business scenarios for movement rules
 * - Advanced filters (type, warehouse, date range)
 *
 * Usage:
 *   node scripts/smoke-test-inventory-movements.mjs
 *   node scripts/smoke-test-inventory-movements.mjs http://localhost:3000/api
 */

const BASE_URL = process.argv[2] ?? "http://localhost:3000/api";

let passed = 0;
let failed = 0;

function ok(label, detail = "") {
  console.log(`  [PASS] ${label}${detail ? ` (${detail})` : ""}`);
  passed++;
}

function fail(label, detail = "") {
  console.error(`  [FAIL] ${label}${detail ? ` -> ${detail}` : ""}`);
  failed++;
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // ignore non-JSON responses
  }

  return { status: res.status, json };
}

const TEST_EMAIL = `smoke_inventory_movements_${Date.now()}@integra360.test`;
const TEST_PASSWORD = "SmokeTest1!";
const COMPANY_ID = 2;

async function step1_healthCheck() {
  console.log("\n[1] Health check");
  const { status } = await request("GET", "/health");
  status === 200 ? ok("GET /health") : fail("GET /health", `got ${status}`);
}

async function step2_registerAndLogin() {
  console.log("\n[2] Register and login");

  const registerRes = await request("POST", "/auth/register", {
    fullName: "Smoke Inventory Movements User",
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    companyId: COMPANY_ID
  });

  if (registerRes.status !== 201 && registerRes.status !== 200) {
    fail("POST /auth/register", registerRes.json?.message ?? `status ${registerRes.status}`);
    return null;
  }
  ok("POST /auth/register");

  const loginRes = await request("POST", "/auth/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    companyId: COMPANY_ID
  });

  if ((loginRes.status === 200 || loginRes.status === 201) && loginRes.json?.accessToken) {
    ok("POST /auth/login", "access token received");
    return loginRes.json.accessToken;
  }

  fail("POST /auth/login", loginRes.json?.message ?? `status ${loginRes.status}`);
  return null;
}

async function step3_lookupRequiredData(token) {
  console.log("\n[3] Lookup required data");

  const [typesRes, warehousesRes, inventoryRes] = await Promise.all([
    request("GET", "/inventory-movement-types", null, token),
    request("GET", "/warehouses", null, token),
    request("GET", "/inventory", null, token)
  ]);

  if (typesRes.status !== 200) {
    fail("GET /inventory-movement-types", `status ${typesRes.status}`);
    return null;
  }

  if (warehousesRes.status !== 200) {
    fail("GET /warehouses", `status ${warehousesRes.status}`);
    return null;
  }

  if (inventoryRes.status !== 200) {
    fail("GET /inventory", `status ${inventoryRes.status}`);
    return null;
  }

  const movementTypes = normalizeList(typesRes.json);
  const warehouses = normalizeList(warehousesRes.json).filter((w) => w.is_active !== false);
  const inventory = normalizeList(inventoryRes.json);

  const inType = movementTypes.find((t) => t.direction === "IN");
  const outType = movementTypes.find((t) => t.direction === "OUT");
  const transferType = movementTypes.find((t) => t.direction === "TRANSFER");

  if (!inType || !outType || !transferType) {
    fail("Movement type lookup", "required IN/OUT/TRANSFER types not found");
    return null;
  }

  const sourceStock = inventory.find((row) => Number(row.quantity_available ?? 0) >= 2);
  if (!sourceStock) {
    fail("Inventory source lookup", "no source inventory row with available >= 2");
    return null;
  }

  const sourceWarehouseId = Number(sourceStock.warehouse_id);
  const destinationWarehouse = warehouses.find((w) => Number(w.id) !== sourceWarehouseId);
  if (!destinationWarehouse) {
    fail("Destination warehouse lookup", "requires at least two active warehouses");
    return null;
  }

  ok("Movement types lookup", `IN=${inType.code}, OUT=${outType.code}, TRANSFER=${transferType.code}`);
  ok("Source inventory lookup", `warehouse=${sourceWarehouseId}, variant=${sourceStock.product_variant_id}, available=${sourceStock.quantity_available}`);
  ok("Destination warehouse lookup", `warehouse=${destinationWarehouse.id}`);

  return {
    inTypeId: Number(inType.id),
    outTypeId: Number(outType.id),
    transferTypeId: Number(transferType.id),
    sourceWarehouseId,
    destinationWarehouseId: Number(destinationWarehouse.id),
    variantId: Number(sourceStock.product_variant_id)
  };
}

async function step4_createValidIn(token, ctx) {
  console.log("\n[4] Create valid IN movement");

  const payload = {
    movement_type_id: ctx.inTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 1.25,
    unit_cost: 1990.5,
    reason: "SMOKE_VALID_IN"
  };

  const res = await request("POST", "/inventory-movements", payload, token);
  if (res.status === 201 && res.json?.id) {
    ok("POST /inventory-movements IN", `id=${res.json.id}`);
    return res.json;
  }

  fail("POST /inventory-movements IN", res.json?.message ?? `status ${res.status}`);
  return null;
}

async function step5_createValidOut(token, ctx) {
  console.log("\n[5] Create valid OUT movement");

  const payload = {
    movement_type_id: ctx.outTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0.5,
    reason: "SMOKE_VALID_OUT"
  };

  const res = await request("POST", "/inventory-movements", payload, token);
  if (res.status === 201 && res.json?.id) {
    ok("POST /inventory-movements OUT", `id=${res.json.id}`);
    return res.json;
  }

  fail("POST /inventory-movements OUT", res.json?.message ?? `status ${res.status}`);
  return null;
}

async function step6_createValidTransfer(token, ctx) {
  console.log("\n[6] Create valid TRANSFER movement");

  const payload = {
    movement_type_id: ctx.transferTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    related_warehouse_id: ctx.destinationWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0.25,
    reason: "SMOKE_VALID_TRANSFER"
  };

  const res = await request("POST", "/inventory-movements", payload, token);
  if (res.status === 201 && res.json?.id) {
    ok("POST /inventory-movements TRANSFER", `id=${res.json.id}`);
    return res.json;
  }

  fail("POST /inventory-movements TRANSFER", res.json?.message ?? `status ${res.status}`);
  return null;
}

async function step7_invalidTransferMissingRelated(token, ctx) {
  console.log("\n[7] Invalid TRANSFER without related warehouse");

  const res = await request("POST", "/inventory-movements", {
    movement_type_id: ctx.transferTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0.1,
    reason: "SMOKE_INVALID_TRANSFER_NO_RELATED"
  }, token);

  if (res.status === 400) {
    ok("TRANSFER without related warehouse returns 400");
  } else {
    fail("TRANSFER without related warehouse", `expected 400, got ${res.status}`);
  }
}

async function step8_invalidInWithRelated(token, ctx) {
  console.log("\n[8] Invalid IN with related warehouse");

  const res = await request("POST", "/inventory-movements", {
    movement_type_id: ctx.inTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    related_warehouse_id: ctx.destinationWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0.1,
    reason: "SMOKE_INVALID_IN_WITH_RELATED"
  }, token);

  if (res.status === 400) {
    ok("IN with related warehouse returns 400");
  } else {
    fail("IN with related warehouse", `expected 400, got ${res.status}`);
  }
}

async function step9_invalidSourceTypeWithoutId(token, ctx) {
  console.log("\n[9] Invalid source_document_type without source_document_id");

  const res = await request("POST", "/inventory-movements", {
    movement_type_id: ctx.inTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0.1,
    source_document_type: "DOCUMENT"
  }, token);

  if (res.status === 400) {
    ok("source_document_type without id returns 400");
  } else {
    fail("source_document_type without id", `expected 400, got ${res.status}`);
  }
}

async function step10_invalidSourceIdWithoutType(token, ctx) {
  console.log("\n[10] Invalid source_document_id without source_document_type");

  const res = await request("POST", "/inventory-movements", {
    movement_type_id: ctx.inTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0.1,
    source_document_id: 999999
  }, token);

  if (res.status === 400) {
    ok("source_document_id without type returns 400");
  } else {
    fail("source_document_id without type", `expected 400, got ${res.status}`);
  }
}

async function step11_invalidQuantity(token, ctx) {
  console.log("\n[11] Invalid quantity");

  const res = await request("POST", "/inventory-movements", {
    movement_type_id: ctx.inTypeId,
    warehouse_id: ctx.sourceWarehouseId,
    product_variant_id: ctx.variantId,
    quantity: 0,
    reason: "SMOKE_INVALID_QTY_ZERO"
  }, token);

  if (res.status === 400) {
    ok("quantity <= 0 returns 400");
  } else {
    fail("quantity <= 0", `expected 400, got ${res.status}`);
  }
}

async function step12_validateFilters(token, createdIn, ctx) {
  console.log("\n[12] Validate advanced filters");

  const movementTypeRes = await request("GET", `/inventory-movements?movement_type_id=${ctx.inTypeId}`, null, token);
  const listByType = normalizeList(movementTypeRes.json);
  const hasByType = listByType.some((row) => String(row.id) === String(createdIn.id));
  hasByType
    ? ok("GET /inventory-movements?movement_type_id=... includes created IN")
    : fail("GET /inventory-movements?movement_type_id=... includes created IN", `status ${movementTypeRes.status}`);

  const warehouseRes = await request("GET", `/inventory-movements?warehouse_id=${ctx.sourceWarehouseId}`, null, token);
  const listByWarehouse = normalizeList(warehouseRes.json);
  const hasByWarehouse = listByWarehouse.some((row) => String(row.id) === String(createdIn.id));
  hasByWarehouse
    ? ok("GET /inventory-movements?warehouse_id=... includes created IN")
    : fail("GET /inventory-movements?warehouse_id=... includes created IN", `status ${warehouseRes.status}`);

  const dateOnly = String(createdIn.movement_date).slice(0, 10);
  const dateFrom = `${dateOnly}T00:00:00.000Z`;
  const dateTo = `${dateOnly}T23:59:59.999Z`;

  const dateRes = await request(
    "GET",
    `/inventory-movements?date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}`,
    null,
    token
  );

  const listByDate = normalizeList(dateRes.json);
  const hasByDate = listByDate.some((row) => String(row.id) === String(createdIn.id));
  hasByDate
    ? ok("GET /inventory-movements date range includes created IN")
    : fail("GET /inventory-movements date range includes created IN", `status ${dateRes.status}`);
}

function printSummary() {
  const total = passed + failed;
  console.log("\n==============================================");
  console.log(`Inventory movements smoke: ${passed}/${total} passed`);
  if (failed > 0) {
    console.error(`Failed checks: ${failed}`);
    process.exitCode = 1;
  } else {
    console.log("All checks passed");
  }
  console.log("==============================================\n");
}

async function run() {
  console.log("==============================================");
  console.log("Inventory Movements Module - E2E Smoke Test");
  console.log(`Target: ${BASE_URL}`);
  console.log("==============================================");

  await step1_healthCheck();

  const token = await step2_registerAndLogin();
  if (!token) {
    console.log("\nSkipping remaining steps due to authentication failure.");
    printSummary();
    return;
  }

  const ctx = await step3_lookupRequiredData(token);
  if (!ctx) {
    console.log("\nSkipping remaining steps due to missing prerequisites.");
    printSummary();
    return;
  }

  const createdIn = await step4_createValidIn(token, ctx);
  if (!createdIn) {
    console.log("\nSkipping remaining steps because valid IN creation failed.");
    printSummary();
    return;
  }

  await step5_createValidOut(token, ctx);
  await step6_createValidTransfer(token, ctx);
  await step7_invalidTransferMissingRelated(token, ctx);
  await step8_invalidInWithRelated(token, ctx);
  await step9_invalidSourceTypeWithoutId(token, ctx);
  await step10_invalidSourceIdWithoutType(token, ctx);
  await step11_invalidQuantity(token, ctx);
  await step12_validateFilters(token, createdIn, ctx);

  printSummary();
}

run().catch((error) => {
  console.error("Unhandled error:", error);
  process.exitCode = 1;
});
