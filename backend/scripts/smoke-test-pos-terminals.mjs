/**
 * POS Terminals Module - E2E Smoke Test
 *
 * Usage:
 *   node scripts/smoke-test-pos-terminals.mjs
 *   node scripts/smoke-test-pos-terminals.mjs http://localhost:3000/api
 *
 * One-command setup + smoke:
 *   npm run smoke:pos-terminals --workspace=backend
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
    // Non-JSON responses are valid for 204 and some error bodies.
  }

  return { status: res.status, json };
}

const TEST_EMAIL = `smoke_pos_${Date.now()}@integra360.test`;
const TEST_PASSWORD = "SmokeTest1!";
const COMPANY_ID = 2;

const POS_WAREHOUSE_CODE = "DEMO-POS-WH";
const LOCKED_TERMINAL_CODE = "DEMO-POS-TERM-LOCK";

async function step1_healthCheck() {
  console.log("\n[1] Health check");
  const { status } = await request("GET", "/health");
  status === 200 ? ok("GET /health") : fail("GET /health", `got ${status}`);
}

async function step2_registerAndLogin() {
  console.log("\n[2] Register and login");

  const registerRes = await request("POST", "/auth/register", {
    fullName: "Smoke POS User",
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

  const terminalsRes = await request("GET", "/pos-terminals", null, token);
  if (terminalsRes.status !== 200 || !Array.isArray(terminalsRes.json)) {
    fail("GET /pos-terminals", `status ${terminalsRes.status}`);
    return null;
  }

  const lockedTerminal = terminalsRes.json.find((t) => t.code === LOCKED_TERMINAL_CODE);
  if (!lockedTerminal) {
    fail("Seed terminal lookup", `${LOCKED_TERMINAL_CODE} not found`);
    return null;
  }
  ok("Seed terminal lookup", `${LOCKED_TERMINAL_CODE} id=${lockedTerminal.id}`);

  const warehousesRes = await request("GET", "/warehouses", null, token);
  if (warehousesRes.status !== 200 || !Array.isArray(warehousesRes.json)) {
    fail("GET /warehouses", `status ${warehousesRes.status}`);
    return null;
  }

  const warehouse = warehousesRes.json.find((w) => w.code === POS_WAREHOUSE_CODE);
  if (!warehouse) {
    fail("Seed warehouse lookup", `${POS_WAREHOUSE_CODE} not found`);
    return null;
  }
  ok("Seed warehouse lookup", `${POS_WAREHOUSE_CODE} id=${warehouse.id}`);

  return { lockedTerminalId: lockedTerminal.id, warehouseId: Number(warehouse.id) };
}

async function step4_validateDependencyDeleteBlocked(token, lockedTerminalId) {
  console.log("\n[4] Validate delete protection (dependencies)");
  const deleteRes = await request("DELETE", `/pos-terminals/${lockedTerminalId}`, null, token);

  if (deleteRes.status === 409) {
    ok("DELETE locked terminal returns 409");
  } else {
    fail("DELETE locked terminal", `expected 409, got ${deleteRes.status}`);
  }
}

async function step5_createTerminal(token, warehouseId) {
  console.log("\n[5] Create terminal");
  const code = `SMOKE-POS-${Date.now()}`;
  const payload = {
    warehouse_id: warehouseId,
    code,
    name: "Terminal Smoke Test",
    device_name: "SMOKE-DEVICE-01",
    serial_number: `SMOKE-SN-${Date.now()}`,
    is_active: true
  };

  const createRes = await request("POST", "/pos-terminals", payload, token);
  if (createRes.status === 201 && createRes.json?.id) {
    ok("POST /pos-terminals", `id=${createRes.json.id}`);
    return createRes.json.id;
  }

  fail("POST /pos-terminals", createRes.json?.message ?? `status ${createRes.status}`);
  return null;
}

async function step6_getAndUpdate(token, createdId, warehouseId) {
  console.log("\n[6] Get and update created terminal");

  const getRes = await request("GET", `/pos-terminals/${createdId}`, null, token);
  if (getRes.status === 200 && getRes.json?.id == createdId) {
    ok(`GET /pos-terminals/${createdId}`);
  } else {
    fail(`GET /pos-terminals/${createdId}`, getRes.json?.message ?? `status ${getRes.status}`);
  }

  const updateRes = await request("PUT", `/pos-terminals/${createdId}`, {
    warehouse_id: warehouseId,
    name: "Terminal Smoke Test Updated",
    device_name: "SMOKE-DEVICE-02",
    serial_number: `SMOKE-SN-UPD-${Date.now()}`,
    is_active: false
  }, token);

  if (updateRes.status === 200 && updateRes.json?.name === "Terminal Smoke Test Updated" && updateRes.json?.is_active === false) {
    ok(`PUT /pos-terminals/${createdId}`, "updated and deactivated");
  } else {
    fail(`PUT /pos-terminals/${createdId}`, updateRes.json?.message ?? `status ${updateRes.status}`);
  }
}

async function step7_deleteAndVerify(token, createdId) {
  console.log("\n[7] Delete created terminal and verify");

  const deleteRes = await request("DELETE", `/pos-terminals/${createdId}`, null, token);
  if (deleteRes.status === 204 || deleteRes.status === 200) {
    ok(`DELETE /pos-terminals/${createdId}`);
  } else {
    fail(`DELETE /pos-terminals/${createdId}`, `status ${deleteRes.status}`);
  }

  const getAfterDelete = await request("GET", `/pos-terminals/${createdId}`, null, token);
  if (getAfterDelete.status === 404) {
    ok(`GET /pos-terminals/${createdId} after delete`, "404 expected");
  } else {
    fail(`GET /pos-terminals/${createdId} after delete`, `expected 404, got ${getAfterDelete.status}`);
  }

  const listAfterDelete = await request("GET", "/pos-terminals", null, token);
  const list = Array.isArray(listAfterDelete.json) ? listAfterDelete.json : [];
  const existsInList = list.some((item) => String(item.id) === String(createdId));
  if (!existsInList) {
    ok("Deleted terminal absent from list");
  } else {
    fail("Deleted terminal absent from list", "still present");
  }
}

function printSummary() {
  const total = passed + failed;
  console.log("\n==============================================");
  console.log(`POS terminals smoke: ${passed}/${total} passed`);
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
  console.log("POS Terminals Module - E2E Smoke Test");
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

  await step4_validateDependencyDeleteBlocked(token, ids.lockedTerminalId);

  const createdId = await step5_createTerminal(token, ids.warehouseId);
  if (!createdId) {
    console.log("\nSkipping update/delete due to create failure.");
    printSummary();
    return;
  }

  await step6_getAndUpdate(token, createdId, ids.warehouseId);
  await step7_deleteAndVerify(token, createdId);

  printSummary();
}

run().catch((error) => {
  console.error("Unhandled error:", error?.message ?? error);
  process.exitCode = 1;
});
