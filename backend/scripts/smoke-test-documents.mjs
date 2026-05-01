/**
 * Documents Module — E2E Smoke Test
 *
 * Usage:
 *   node scripts/smoke-test-documents.mjs
 *   node scripts/smoke-test-documents.mjs http://localhost:3000/api
 *
 * Or via npm:
 *   npm run smoke:documents --workspace=backend
 */

const BASE_URL = process.argv[2] ?? "http://localhost:3000/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label, detail = "") {
  console.log(`  ✅ PASS  ${label}${detail ? `  (${detail})` : ""}`);
  passed++;
}

function fail(label, detail = "") {
  console.error(`  ❌ FAIL  ${label}${detail ? `  → ${detail}` : ""}`);
  failed++;
}

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, json };
}

// ─── Seed lookups (match documents.seed.sql) ────────────────────────────────

const TEST_EMAIL = `smoke_docs_${Date.now()}@integra360.test`;
const TEST_PASSWORD = "SmokeTest1!";
const COMPANY_ID = 2;

// ─── Steps ──────────────────────────────────────────────────────────────────

async function step1_healthCheck() {
  console.log("\n[1] Health check");
  const { status } = await request("GET", "/health");
  status === 200 ? ok("GET /health → 200") : fail("GET /health", `got ${status}`);
}

async function step2_register() {
  console.log("\n[2] Register test user");
  const { status, json } = await request("POST", "/auth/register", {
    name: "Smoke Test User",
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    company_id: COMPANY_ID,
  });
  if (status === 201 || status === 200) {
    ok("POST /auth/register → 201/200");
    return true;
  }
  fail("POST /auth/register", json?.message ?? `status ${status}`);
  return false;
}

async function step3_login() {
  console.log("\n[3] Login");
  const { status, json } = await request("POST", "/auth/login", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if ((status === 200 || status === 201) && json?.token) {
    ok("POST /auth/login → token received");
    return json.token;
  }
  fail("POST /auth/login", json?.message ?? `status ${status}`);
  return null;
}

async function step4_listDocuments(token) {
  console.log("\n[4] List documents (seed data)");
  const { status, json } = await request("GET", "/documents", null, token);
  if (status === 200 && Array.isArray(json?.data ?? json)) {
    const count = (json?.data ?? json).length;
    ok(`GET /documents → 200`, `${count} record(s)`);
  } else {
    fail("GET /documents", `status ${status} — ${json?.message ?? ""}`);
  }
}

async function step5_lookupIds(token) {
  console.log("\n[5] Lookup required IDs for create");

  // Document type
  const { status: dtStatus, json: dtJson } = await request("GET", "/document-types", null, token);
  const docType = (dtJson?.data ?? dtJson ?? []).find(
    (d) => d.code === "DEMO_FACTURA" || d.type_name?.includes("DEMO")
  );
  if (!docType) {
    fail("GET /document-types — DEMO_FACTURA not found");
    return null;
  }
  ok("GET /document-types", `DEMO_FACTURA id=${docType.id}`);

  // Warehouse
  const { json: whJson } = await request("GET", "/warehouses", null, token);
  const warehouse = (whJson?.data ?? whJson ?? []).find((w) => w.code === "DEMO-DOC-WH");
  if (!warehouse) {
    fail("GET /warehouses — DEMO-DOC-WH not found");
    return null;
  }
  ok("GET /warehouses", `DEMO-DOC-WH id=${warehouse.id}`);

  // Customer
  const { json: custJson } = await request("GET", "/customers", null, token);
  const customer = (custJson?.data ?? custJson ?? []).find(
    (c) => c.tax_id === "11111111-1" || c.business_name?.includes("DEMO-DOC")
  );
  if (!customer) {
    fail("GET /customers — DEMO-DOC customer not found");
    return null;
  }
  ok("GET /customers", `id=${customer.id}`);

  // Product variant
  const { json: pvJson } = await request("GET", "/product-variants", null, token);
  const variant = (pvJson?.data ?? pvJson ?? []).find((v) => v.sku === "DEMO-DOC-VAR-001");
  if (!variant) {
    fail("GET /product-variants — DEMO-DOC-VAR-001 not found");
    return null;
  }
  ok("GET /product-variants", `DEMO-DOC-VAR-001 id=${variant.id}`);

  return {
    documentTypeId: docType.id,
    warehouseId: warehouse.id,
    customerId: customer.id,
    variantId: variant.id,
  };
}

async function step6_createDocument(token, ids) {
  console.log("\n[6] Create document");
  const { documentTypeId, warehouseId, customerId, variantId } = ids;

  const payload = {
    document_type_id: documentTypeId,
    issue_date: new Date().toISOString().slice(0, 10),
    status: "DRAFT",
    counterpart_scope: "CUSTOMER",
    counterpart_id: customerId,
    warehouse_id: warehouseId,
    notes: "Smoke test document",
    details: [
      {
        product_variant_id: variantId,
        warehouse_id: warehouseId,
        quantity: 2,
        unit_price: 10000,
        discount_pct: 0,
        tax_pct: 19,
      },
    ],
  };

  const { status, json } = await request("POST", "/documents", payload, token);
  if (status === 201 && json?.id) {
    ok("POST /documents → 201", `id=${json.id}, number=${json.document_number}`);
    return json.id;
  }
  fail("POST /documents", json?.message ?? `status ${status}`);
  return null;
}

async function step7_getById(token, id) {
  console.log("\n[7] Get document by ID");
  const { status, json } = await request("GET", `/documents/${id}`, null, token);
  if (status === 200 && json?.id == id) {
    const detailCount = json.details?.length ?? 0;
    ok(`GET /documents/${id} → 200`, `status=${json.status}, details=${detailCount}`);
  } else {
    fail(`GET /documents/${id}`, json?.message ?? `status ${status}`);
  }
}

async function step8_updateDocument(token, id, ids) {
  console.log("\n[8] Update document (confirm + replace details)");
  const { warehouseId, variantId } = ids;

  const payload = {
    status: "CONFIRMED",
    notes: "Smoke test — confirmed",
    details: [
      {
        product_variant_id: variantId,
        warehouse_id: warehouseId,
        quantity: 5,
        unit_price: 15000,
        discount_pct: 10,
        tax_pct: 19,
      },
    ],
  };

  const { status, json } = await request("PUT", `/documents/${id}`, payload, token);
  if (status === 200 && json?.status === "CONFIRMED") {
    ok(`PUT /documents/${id} → 200`, `status=CONFIRMED, total=${json.total_amount}`);
  } else {
    fail(`PUT /documents/${id}`, json?.message ?? `status ${status}`);
  }
}

async function step9_deleteDocument(token, id) {
  console.log("\n[9] Delete (soft-delete) document");
  const { status } = await request("DELETE", `/documents/${id}`, null, token);
  if (status === 204 || status === 200) {
    ok(`DELETE /documents/${id} → ${status}`);
  } else {
    fail(`DELETE /documents/${id}`, `status ${status}`);
  }
}

async function step10_verifyDeleted(token, id) {
  console.log("\n[10] Verify document is gone after delete");

  // Should not appear in list
  const { status: listStatus, json: listJson } = await request("GET", "/documents", null, token);
  const list = listJson?.data ?? listJson ?? [];
  const stillInList = list.some((d) => String(d.id) === String(id));
  stillInList
    ? fail("Document still visible in list after delete")
    : ok("Document absent from list after delete");

  // Should return 404 on getById
  const { status: getStatus } = await request("GET", `/documents/${id}`, null, token);
  getStatus === 404
    ? ok(`GET /documents/${id} → 404 (expected)`)
    : fail(`GET /documents/${id}`, `expected 404, got ${getStatus}`);
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function run() {
  console.log("═══════════════════════════════════════════════");
  console.log("  Documents Module — E2E Smoke Test");
  console.log(`  Target: ${BASE_URL}`);
  console.log("═══════════════════════════════════════════════");

  await step1_healthCheck();

  const registered = await step2_register();
  if (!registered) {
    console.log("\n⚠️  Skipping remaining steps — registration failed.");
    printSummary();
    return;
  }

  const token = await step3_login();
  if (!token) {
    console.log("\n⚠️  Skipping remaining steps — login failed.");
    printSummary();
    return;
  }

  await step4_listDocuments(token);

  const ids = await step5_lookupIds(token);
  if (!ids) {
    console.log("\n⚠️  Skipping create/update/delete — seed IDs not found.");
    printSummary();
    return;
  }

  const docId = await step6_createDocument(token, ids);
  if (!docId) {
    console.log("\n⚠️  Skipping update/delete — create failed.");
    printSummary();
    return;
  }

  await step7_getById(token, docId);
  await step8_updateDocument(token, docId, ids);
  await step9_deleteDocument(token, docId);
  await step10_verifyDeleted(token, docId);

  printSummary();
}

function printSummary() {
  const total = passed + failed;
  console.log("\n═══════════════════════════════════════════════");
  console.log(`  Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.error(`  ❌ ${failed} test(s) failed`);
    process.exitCode = 1;
  } else {
    console.log("  ✅ All tests passed");
  }
  console.log("═══════════════════════════════════════════════\n");
}

run().catch((err) => {
  console.error("\nUnhandled error:", err.message);
  process.exitCode = 1;
});
