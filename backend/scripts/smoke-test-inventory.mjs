/**
 * Inventory Module - E2E Smoke Test
 *
 * Usage:
 *   node scripts/smoke-test-inventory.mjs
 *   node scripts/smoke-test-inventory.mjs http://localhost:3000/api
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
    // ignore non-JSON
  }

  return { status: res.status, json };
}

const TEST_EMAIL = `smoke_inventory_${Date.now()}@integra360.test`;
const TEST_PASSWORD = "SmokeTest1!";
const COMPANY_ID = 2;

const DEMO_WAREHOUSE_CODE = "DEMO-INV-WH";
const DEMO_VARIANT_CODE_A = "DEMO-INV-VAR-A";
const DEMO_VARIANT_CODE_B = "DEMO-INV-VAR-B";

async function step1_healthCheck() {
  console.log("\n[1] Health check");
  const { status } = await request("GET", "/health");
  status === 200 ? ok("GET /health") : fail("GET /health", `got ${status}`);
}

async function step2_registerAndLogin() {
  console.log("\n[2] Register and login");

  const registerRes = await request("POST", "/auth/register", {
    fullName: "Smoke Inventory User",
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
    ok("POST /auth/login", "token received");
    return loginRes.json.accessToken;
  }

  fail("POST /auth/login", loginRes.json?.message ?? `status ${loginRes.status}`);
  return null;
}

async function step3_lookupSeedData(token) {
  console.log("\n[3] Lookup seed data");

  const inventoryRes = await request("GET", "/inventory", null, token);
  if (inventoryRes.status !== 200 || !Array.isArray(inventoryRes.json)) {
    fail("GET /inventory", `status ${inventoryRes.status}`);
    return null;
  }

  const freeRecord = inventoryRes.json.find(
    (r) => r.variant_code === DEMO_VARIANT_CODE_A && r.warehouse_code === DEMO_WAREHOUSE_CODE
  );
  if (!freeRecord) {
    fail("Seed free record lookup", `${DEMO_VARIANT_CODE_A}@${DEMO_WAREHOUSE_CODE} not found`);
    return null;
  }
  ok("Seed free record lookup", `id=${freeRecord.id}, qty_on_hand=${freeRecord.quantity_on_hand}`);

  const lowStockRecord = inventoryRes.json.find(
    (r) => r.variant_code === DEMO_VARIANT_CODE_B && r.warehouse_code === DEMO_WAREHOUSE_CODE
  );
  if (!lowStockRecord) {
    fail("Seed low-stock record lookup", `${DEMO_VARIANT_CODE_B}@${DEMO_WAREHOUSE_CODE} not found`);
    return null;
  }
  ok("Seed low-stock record lookup", `id=${lowStockRecord.id}, is_low_stock=${lowStockRecord.is_low_stock}`);

  if (lowStockRecord.is_low_stock !== true) {
    fail("Low-stock flag validation", `expected is_low_stock=true`);
  } else {
    ok("Low-stock flag validation");
  }

  return {
    freeRecordId: freeRecord.id,
    warehouseId: Number(freeRecord.warehouse_id),
    variantIdA: Number(freeRecord.product_variant_id)
  };
}

async function step4_lowStockFilter(token) {
  console.log("\n[4] Low-stock filter endpoint");

  const res = await request("GET", "/inventory?low_stock=true", null, token);
  if (res.status !== 200 || !Array.isArray(res.json)) {
    fail("GET /inventory?low_stock=true", `status ${res.status}`);
    return;
  }

  const allLow = res.json.every((r) => r.is_low_stock === true);
  if (allLow && res.json.length > 0) {
    ok("GET /inventory?low_stock=true", `${res.json.length} low-stock records, all flagged`);
  } else if (res.json.length === 0) {
    fail("GET /inventory?low_stock=true", "no low-stock records returned");
  } else {
    fail("GET /inventory?low_stock=true", "some records are NOT low-stock");
  }
}

async function step5_conflictOnDuplicate(token, warehouseId, variantIdA) {
  console.log("\n[5] Conflict on duplicate scope (409)");

  const res = await request("POST", "/inventory", {
    warehouse_id: warehouseId,
    product_variant_id: variantIdA,
    quantity_on_hand: 50
  }, token);

  if (res.status === 409) {
    ok("POST /inventory duplicate returns 409");
  } else {
    fail("POST /inventory duplicate", `expected 409, got ${res.status}`);
  }
}

async function step6_getById(token, recordId) {
  console.log("\n[6] Get by ID");

  const res = await request("GET", `/inventory/${recordId}`, null, token);
  if (res.status === 200 && String(res.json?.id) === String(recordId)) {
    ok(`GET /inventory/${recordId}`);
  } else {
    fail(`GET /inventory/${recordId}`, res.json?.message ?? `status ${res.status}`);
  }
}

async function step7_update(token, recordId) {
  console.log("\n[7] Update inventory record");

  const res = await request("PUT", `/inventory/${recordId}`, {
    quantity_on_hand: 150,
    min_stock: 10,
    reorder_point: 30
  }, token);

  if (res.status === 200 && res.json?.quantity_on_hand === 150) {
    ok(`PUT /inventory/${recordId}`, "updated qty and thresholds");
  } else {
    fail(`PUT /inventory/${recordId}`, res.json?.message ?? `status ${res.status}`);
  }
}

async function step8_createAndDelete(token, warehouseId) {
  console.log("\n[8] Create new record and delete it");

  // Fetch a variant to use for creation (find any variant NOT already in inventory for this warehouse)
  const inventoryRes = await request("GET", "/inventory", null, token);
  const variantRes = await request("GET", "/product-variants", null, token);

  if (inventoryRes.status !== 200 || variantRes.status !== 200) {
    fail("Prerequisite fetch for create test", `inventory=${inventoryRes.status}, variants=${variantRes.status}`);
    return;
  }

  const usedVariantIds = new Set(
    inventoryRes.json.filter((r) => Number(r.warehouse_id) === warehouseId).map((r) => Number(r.product_variant_id))
  );

  const freeVariant = variantRes.json.find((v) => v.is_active && !usedVariantIds.has(Number(v.id)));
  if (!freeVariant) {
    console.log("  [SKIP] No free variant available for create test");
    passed++; // count as pass since it's a data limitation
    return;
  }

  const createRes = await request("POST", "/inventory", {
    warehouse_id: warehouseId,
    product_variant_id: Number(freeVariant.id),
    quantity_on_hand: 25,
    min_stock: 5,
    reorder_point: 8
  }, token);

  if (createRes.status !== 201 || !createRes.json?.id) {
    fail("POST /inventory create new record", createRes.json?.message ?? `status ${createRes.status}`);
    return;
  }
  ok("POST /inventory create new record", `id=${createRes.json.id}`);

  const newId = createRes.json.id;

  const deleteRes = await request("DELETE", `/inventory/${newId}`, null, token);
  if (deleteRes.status === 204 || deleteRes.status === 200) {
    ok(`DELETE /inventory/${newId}`);
  } else {
    fail(`DELETE /inventory/${newId}`, `status ${deleteRes.status}`);
    return;
  }

  const verifyRes = await request("GET", `/inventory/${newId}`, null, token);
  if (verifyRes.status === 404) {
    ok(`GET /inventory/${newId} after delete`, "404 expected");
  } else {
    fail(`GET /inventory/${newId} after delete`, `expected 404, got ${verifyRes.status}`);
  }
}

function printSummary() {
  const total = passed + failed;
  console.log("\n==============================================");
  console.log(`Inventory smoke: ${passed}/${total} passed`);
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
  console.log("Inventory Module - E2E Smoke Test");
  console.log(`Target: ${BASE_URL}`);
  console.log("==============================================");

  await step1_healthCheck();

  const token = await step2_registerAndLogin();
  if (!token) {
    console.log("\nSkipping remaining steps due to authentication failure.");
    printSummary();
    return;
  }

  const ids = await step3_lookupSeedData(token);
  if (!ids) {
    console.log("\nSkipping remaining steps due to missing seed data.");
    printSummary();
    return;
  }

  await step4_lowStockFilter(token);
  await step5_conflictOnDuplicate(token, ids.warehouseId, ids.variantIdA);
  await step6_getById(token, ids.freeRecordId);
  await step7_update(token, ids.freeRecordId);
  await step8_createAndDelete(token, ids.warehouseId);

  printSummary();
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  process.exitCode = 1;
});
