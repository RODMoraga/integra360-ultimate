/**
 * Cash Registers Module - E2E Smoke Test
 *
 * Usage:
 *   node scripts/smoke-test-cash-registers.mjs
 *   node scripts/smoke-test-cash-registers.mjs http://localhost:3000/api
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

const TEST_EMAIL = `smoke_cash_${Date.now()}@integra360.test`;
const TEST_PASSWORD = "SmokeTest1!";
const COMPANY_ID = 2;

const LOCKED_REGISTER_CODE = "DEMO-CASH-REG-LOCK";
const DEMO_TERMINAL_CODE = "DEMO-CASH-TERM";

async function step1_healthCheck() {
  console.log("\n[1] Health check");
  const { status } = await request("GET", "/health");
  status === 200 ? ok("GET /health") : fail("GET /health", `got ${status}`);
}

async function step2_registerAndLogin() {
  console.log("\n[2] Register and login");

  const registerRes = await request("POST", "/auth/register", {
    fullName: "Smoke Cash User",
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

  const registersRes = await request("GET", "/cash-registers", null, token);
  if (registersRes.status !== 200 || !Array.isArray(registersRes.json)) {
    fail("GET /cash-registers", `status ${registersRes.status}`);
    return null;
  }

  const lockedRegister = registersRes.json.find((r) => r.code === LOCKED_REGISTER_CODE);
  if (!lockedRegister) {
    fail("Seed register lookup", `${LOCKED_REGISTER_CODE} not found`);
    return null;
  }
  ok("Seed register lookup", `${LOCKED_REGISTER_CODE} id=${lockedRegister.id}`);

  const terminalsRes = await request("GET", "/pos-terminals", null, token);
  if (terminalsRes.status !== 200 || !Array.isArray(terminalsRes.json)) {
    fail("GET /pos-terminals", `status ${terminalsRes.status}`);
    return null;
  }

  const terminal = terminalsRes.json.find((t) => t.code === DEMO_TERMINAL_CODE);
  if (!terminal) {
    fail("Seed terminal lookup", `${DEMO_TERMINAL_CODE} not found`);
    return null;
  }
  ok("Seed terminal lookup", `${DEMO_TERMINAL_CODE} id=${terminal.id}`);

  return { lockedRegisterId: lockedRegister.id, terminalId: Number(terminal.id) };
}

async function step4_validateDependencyDeleteBlocked(token, lockedRegisterId) {
  console.log("\n[4] Validate delete protection (cash openings dependency)");
  const deleteRes = await request("DELETE", `/cash-registers/${lockedRegisterId}`, null, token);

  if (deleteRes.status === 409) {
    ok("DELETE locked cash register returns 409");
  } else {
    fail("DELETE locked cash register", `expected 409, got ${deleteRes.status}`);
  }
}

async function step5_createCashRegister(token, terminalId) {
  console.log("\n[5] Create cash register");
  const code = `SMOKE-CASH-${Date.now()}`;

  const createRes = await request("POST", "/cash-registers", {
    terminal_id: terminalId,
    code,
    name: "Caja Smoke Test",
    is_active: true
  }, token);

  if (createRes.status === 201 && createRes.json?.id) {
    ok("POST /cash-registers", `id=${createRes.json.id}`);
    return createRes.json.id;
  }

  fail("POST /cash-registers", createRes.json?.message ?? `status ${createRes.status}`);
  return null;
}

async function step6_getAndUpdate(token, cashRegisterId, terminalId) {
  console.log("\n[6] Get and update created cash register");

  const getRes = await request("GET", `/cash-registers/${cashRegisterId}`, null, token);
  if (getRes.status === 200 && String(getRes.json?.id) === String(cashRegisterId)) {
    ok(`GET /cash-registers/${cashRegisterId}`);
  } else {
    fail(`GET /cash-registers/${cashRegisterId}`, getRes.json?.message ?? `status ${getRes.status}`);
  }

  const updateRes = await request("PUT", `/cash-registers/${cashRegisterId}`, {
    terminal_id: terminalId,
    name: "Caja Smoke Test Updated",
    is_active: false
  }, token);

  if (updateRes.status === 200 && updateRes.json?.name === "Caja Smoke Test Updated" && updateRes.json?.is_active === false) {
    ok(`PUT /cash-registers/${cashRegisterId}`, "updated and deactivated");
  } else {
    fail(`PUT /cash-registers/${cashRegisterId}`, updateRes.json?.message ?? `status ${updateRes.status}`);
  }
}

async function step7_deleteAndVerify(token, cashRegisterId) {
  console.log("\n[7] Delete created cash register and verify");

  const deleteRes = await request("DELETE", `/cash-registers/${cashRegisterId}`, null, token);
  if (deleteRes.status === 204 || deleteRes.status === 200) {
    ok(`DELETE /cash-registers/${cashRegisterId}`);
  } else {
    fail(`DELETE /cash-registers/${cashRegisterId}`, `status ${deleteRes.status}`);
  }

  const getAfterDelete = await request("GET", `/cash-registers/${cashRegisterId}`, null, token);
  if (getAfterDelete.status === 404) {
    ok(`GET /cash-registers/${cashRegisterId} after delete`, "404 expected");
  } else {
    fail(`GET /cash-registers/${cashRegisterId} after delete`, `expected 404, got ${getAfterDelete.status}`);
  }

  const listAfterDelete = await request("GET", "/cash-registers", null, token);
  const list = Array.isArray(listAfterDelete.json) ? listAfterDelete.json : [];
  const existsInList = list.some((item) => String(item.id) === String(cashRegisterId));

  if (!existsInList) {
    ok("Deleted cash register absent from list");
  } else {
    fail("Deleted cash register absent from list", "still present");
  }
}

function printSummary() {
  const total = passed + failed;
  console.log("\n==============================================");
  console.log(`Cash registers smoke: ${passed}/${total} passed`);
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
  console.log("Cash Registers Module - E2E Smoke Test");
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

  await step4_validateDependencyDeleteBlocked(token, ids.lockedRegisterId);

  const createdId = await step5_createCashRegister(token, ids.terminalId);
  if (!createdId) {
    console.log("\nSkipping update/delete due to create failure.");
    printSummary();
    return;
  }

  await step6_getAndUpdate(token, createdId, ids.terminalId);
  await step7_deleteAndVerify(token, createdId);

  printSummary();
}

run().catch((error) => {
  console.error("Unhandled error:", error?.message ?? error);
  process.exitCode = 1;
});
