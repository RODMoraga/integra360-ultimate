/**
 * Documents Module - E2E Smoke Test
 *
 * Coverage:
 * - CRUD (create, read, update, delete)
 * - Basic list and filtered list checks
 * - Detail validation (invalid quantity)
 *
 * Usage:
 *   node scripts/smoke-test-documents.mjs
 *   node scripts/smoke-test-documents.mjs http://localhost:3000/api
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
    // ignore non-JSON
  }

  return { status: res.status, json };
}

const TEST_EMAIL = `smoke_docs_${Date.now()}@integra360.test`;
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
    fullName: "Smoke Documents User",
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

async function step3_lookupRequiredIds(token) {
  console.log("\n[3] Lookup required IDs");

  const [typesRes, seqRes, customersRes, suppliersRes, warehousesRes, variantsRes] = await Promise.all([
    request("GET", "/document-types", null, token),
    request("GET", "/document-sequences", null, token),
    request("GET", "/customers", null, token),
    request("GET", "/suppliers", null, token),
    request("GET", "/warehouses", null, token),
    request("GET", "/product-variants", null, token)
  ]);

  if (typesRes.status !== 200 || seqRes.status !== 200) {
    fail("Document catalogs", `types=${typesRes.status}, sequences=${seqRes.status}`);
    return null;
  }

  const types = normalizeList(typesRes.json);
  const sequences = normalizeList(seqRes.json);
  const customers = normalizeList(customersRes.json).filter((c) => c.is_active !== false);
  const suppliers = normalizeList(suppliersRes.json).filter((s) => s.is_active !== false);
  const warehouses = normalizeList(warehousesRes.json).filter((w) => w.is_active !== false);
  const variants = normalizeList(variantsRes.json).filter((v) => v.is_active !== false);

  if (warehouses.length === 0 || variants.length === 0) {
    fail("Warehouse/variant lookup", "missing active data for smoke test");
    return null;
  }

  const year = new Date().getUTCFullYear();
  const typesById = new Map(types.map((t) => [String(t.id), t]));
  const candidateSequences = sequences.filter((s) => Number(s.year_num) === year);

  if (candidateSequences.length === 0) {
    fail("Document sequence lookup", `no sequences for year ${year}`);
    return null;
  }

  const withType = candidateSequences
    .map((seq) => ({ seq, type: typesById.get(String(seq.document_type_id)) }))
    .filter((row) => Boolean(row.type));

  const preferred = withType.find((row) => row.type.counterpart_scope === "CUSTOMER")
    ?? withType.find((row) => row.type.counterpart_scope === "SUPPLIER")
    ?? withType.find((row) => row.type.counterpart_scope === "NONE");

  if (!preferred) {
    fail("Document type resolution", "no valid type for existing sequence");
    return null;
  }

  if (preferred.type.counterpart_scope === "CUSTOMER" && customers.length === 0) {
    fail("Customer lookup", "required by selected document type");
    return null;
  }

  if (preferred.type.counterpart_scope === "SUPPLIER" && suppliers.length === 0) {
    fail("Supplier lookup", "required by selected document type");
    return null;
  }

  const warehouse = warehouses[0];
  const variant = variants[0];
  const customer = customers[0] ?? null;
  const supplier = suppliers[0] ?? null;

  ok("Document type + sequence", `${preferred.type.code} (${preferred.type.counterpart_scope})`);
  ok("Warehouse", `${warehouse.code ?? warehouse.id}`);
  ok("Variant", `${variant.variant_code ?? variant.id}`);

  return {
    documentType: preferred.type,
    warehouse,
    variant,
    customer,
    supplier,
    today: new Date().toISOString().slice(0, 10)
  };
}

async function step4_listDocuments(token) {
  console.log("\n[4] List documents");
  const { status, json } = await request("GET", "/documents", null, token);
  const list = normalizeList(json);

  if (status === 200 && Array.isArray(list)) {
    ok("GET /documents", `${list.length} record(s)`);
  } else {
    fail("GET /documents", `status ${status}`);
  }
}

function createDocumentPayload(ctx) {
  const payload = {
    document_type_id: Number(ctx.documentType.id),
    document_date: ctx.today,
    warehouse_id: Number(ctx.warehouse.id),
    status: "DRAFT",
    notes: "Smoke test document",
    details: [
      {
        product_variant_id: Number(ctx.variant.id),
        warehouse_id: Number(ctx.warehouse.id),
        quantity: 2,
        unit_price: 15000,
        discount_amount: 1000,
        tax_amount: 5510
      }
    ]
  };

  if (ctx.documentType.counterpart_scope === "CUSTOMER" && ctx.customer) {
    payload.customer_id = Number(ctx.customer.id);
  }

  if (ctx.documentType.counterpart_scope === "SUPPLIER" && ctx.supplier) {
    payload.supplier_id = Number(ctx.supplier.id);
  }

  return payload;
}

async function step5_createDocument(token, ctx) {
  console.log("\n[5] Create document");

  const { status, json } = await request("POST", "/documents", createDocumentPayload(ctx), token);
  if (status === 201 && json?.id) {
    ok("POST /documents", `id=${json.id}, number=${json.document_number_label}`);
    return json;
  }

  fail("POST /documents", json?.message ?? `status ${status}`);
  return null;
}

async function step6_getById(token, docId) {
  console.log("\n[6] Get document by ID");
  const { status, json } = await request("GET", `/documents/${docId}`, null, token);

  if (status === 200 && String(json?.id) === String(docId)) {
    const detailCount = Array.isArray(json?.details) ? json.details.length : 0;
    ok(`GET /documents/${docId}`, `status=${json.status}, details=${detailCount}`);
  } else {
    fail(`GET /documents/${docId}`, json?.message ?? `status ${status}`);
  }
}

async function step7_filters(token, document, today) {
  console.log("\n[7] Validate filters");

  const statusRes = await request("GET", "/documents?status=DRAFT", null, token);
  const statusList = normalizeList(statusRes.json);
  const inStatusFilter = statusList.some((row) => String(row.id) === String(document.id));
  inStatusFilter
    ? ok("GET /documents?status=DRAFT includes created document")
    : fail("GET /documents?status=DRAFT includes created document", `status=${statusRes.status}`);

  const partnerTerm = (document.partner_name ?? document.customer_name ?? document.supplier_name ?? "")
    .split(" ")[0]
    ?.trim() || "";

  const partnerRes = await request("GET", `/documents?partner_name=${encodeURIComponent(partnerTerm)}`, null, token);
  const partnerList = normalizeList(partnerRes.json);
  const inPartnerFilter = partnerList.some((row) => String(row.id) === String(document.id));
  inPartnerFilter
    ? ok("GET /documents?partner_name=... includes created document")
    : fail("GET /documents?partner_name=... includes created document", `status=${partnerRes.status}`);

  const dateRes = await request("GET", `/documents?date_from=${today}&date_to=${today}`, null, token);
  const dateList = normalizeList(dateRes.json);
  const inDateFilter = dateList.some((row) => String(row.id) === String(document.id));
  inDateFilter
    ? ok("GET /documents date range includes created document")
    : fail("GET /documents date range includes created document", `status=${dateRes.status}`);
}

async function step8_detailValidation(token, ctx) {
  console.log("\n[8] Validate detail payload errors");

  const invalidPayload = createDocumentPayload(ctx);
  invalidPayload.details[0].quantity = 0;

  const { status, json } = await request("POST", "/documents", invalidPayload, token);

  if (status === 400) {
    ok("POST /documents invalid detail returns 400");
  } else {
    fail("POST /documents invalid detail", json?.message ?? `expected 400, got ${status}`);
  }
}

async function step9_updateDocument(token, docId, ctx) {
  console.log("\n[9] Update document");

  const payload = {
    status: "CONFIRMED",
    notes: "Smoke test document confirmed",
    details: [
      {
        product_variant_id: Number(ctx.variant.id),
        warehouse_id: Number(ctx.warehouse.id),
        quantity: 3,
        unit_price: 12000,
        discount_amount: 500,
        tax_amount: 6745
      }
    ]
  };

  const { status, json } = await request("PUT", `/documents/${docId}`, payload, token);
  if (status === 200 && json?.status === "CONFIRMED") {
    ok(`PUT /documents/${docId}`, `total=${json.total}`);
  } else {
    fail(`PUT /documents/${docId}`, json?.message ?? `status ${status}`);
  }
}

async function step10_deleteDocument(token, docId) {
  console.log("\n[10] Delete document");
  const { status } = await request("DELETE", `/documents/${docId}`, null, token);

  if (status === 204 || status === 200) {
    ok(`DELETE /documents/${docId}`);
  } else {
    fail(`DELETE /documents/${docId}`, `status ${status}`);
  }
}

async function step11_verifyDeleted(token, docId) {
  console.log("\n[11] Verify deleted document");

  const listRes = await request("GET", "/documents", null, token);
  const list = normalizeList(listRes.json);
  const stillInList = list.some((row) => String(row.id) === String(docId));

  stillInList
    ? fail("Deleted document absent from list", "still visible")
    : ok("Deleted document absent from list");

  const getRes = await request("GET", `/documents/${docId}`, null, token);
  if (getRes.status === 404) {
    ok(`GET /documents/${docId} after delete`, "404 expected");
  } else {
    fail(`GET /documents/${docId} after delete`, `expected 404, got ${getRes.status}`);
  }
}

function printSummary() {
  const total = passed + failed;
  console.log("\n==============================================");
  console.log(`Documents smoke: ${passed}/${total} passed`);
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
  console.log("Documents Module - E2E Smoke Test");
  console.log(`Target: ${BASE_URL}`);
  console.log("==============================================");

  await step1_healthCheck();

  const token = await step2_registerAndLogin();
  if (!token) {
    console.log("\nSkipping remaining steps due to authentication failure.");
    printSummary();
    return;
  }

  const ctx = await step3_lookupRequiredIds(token);
  if (!ctx) {
    console.log("\nSkipping remaining steps due to missing seed/reference data.");
    printSummary();
    return;
  }

  await step4_listDocuments(token);

  const document = await step5_createDocument(token, ctx);
  if (!document?.id) {
    console.log("\nSkipping remaining CRUD steps due to create failure.");
    printSummary();
    return;
  }

  await step6_getById(token, document.id);
  await step7_filters(token, document, ctx.today);
  await step8_detailValidation(token, ctx);
  await step9_updateDocument(token, document.id, ctx);
  await step10_deleteDocument(token, document.id);
  await step11_verifyDeleted(token, document.id);

  printSummary();
}

run().catch((err) => {
  console.error("Unhandled error:", err?.message ?? err);
  process.exitCode = 1;
});
