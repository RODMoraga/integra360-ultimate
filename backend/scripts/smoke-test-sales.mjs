/**
 * Sales Module - E2E Smoke Test
 *
 * Coverage:
 * - CRUD (create, read, update, delete)
 * - Filters (status, date range, partner_name)
 * - Detail validations (invalid quantity)
 *
 * Usage:
 *   node scripts/smoke-test-sales.mjs
 *   node scripts/smoke-test-sales.mjs http://localhost:3000/api
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

const TEST_EMAIL = `smoke_sales_${Date.now()}@integra360.test`;
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
    fullName: "Smoke Sales User",
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

  const [typesRes, seqRes, customersRes, warehousesRes, variantsRes] = await Promise.all([
    request("GET", "/document-types", null, token),
    request("GET", "/document-sequences", null, token),
    request("GET", "/customers", null, token),
    request("GET", "/warehouses", null, token),
    request("GET", "/product-variants", null, token)
  ]);

  if (typesRes.status !== 200) {
    fail("GET /document-types", `status ${typesRes.status}`);
    return null;
  }

  if (seqRes.status !== 200) {
    fail("GET /document-sequences", `status ${seqRes.status}`);
    return null;
  }

  const types = normalizeList(typesRes.json);
  const sequences = normalizeList(seqRes.json);
  const customers = normalizeList(customersRes.json).filter((c) => c.is_active !== false);
  const warehouses = normalizeList(warehousesRes.json).filter((w) => w.is_active !== false);
  const variants = normalizeList(variantsRes.json).filter((v) => v.is_active !== false);

  if (customers.length === 0) {
    fail("GET /customers", "no active customers found");
    return null;
  }

  if (warehouses.length === 0) {
    fail("GET /warehouses", "no active warehouses found");
    return null;
  }

  if (variants.length === 0) {
    fail("GET /product-variants", "no active variants found");
    return null;
  }

  const year = new Date().getUTCFullYear();
  const typesById = new Map(types.map((t) => [String(t.id), t]));
  const yearSequences = sequences.filter((s) => Number(s.year_num) === year);

  if (yearSequences.length === 0) {
    fail("GET /document-sequences", `no sequences for year ${year}`);
    return null;
  }

  const saleCandidateSequences = yearSequences.filter((seq) => {
    const type = typesById.get(String(seq.document_type_id));
    return type && type.counterpart_scope !== "SUPPLIER";
  });

  if (saleCandidateSequences.length === 0) {
    fail("Document sequence selection", "no sales-compatible sequence found");
    return null;
  }

  // Prefer a CUSTOMER type to satisfy real sales flow, fallback to NONE.
  const preferred = saleCandidateSequences.find((seq) => {
    const type = typesById.get(String(seq.document_type_id));
    return type?.counterpart_scope === "CUSTOMER";
  }) ?? saleCandidateSequences.find((seq) => {
    const type = typesById.get(String(seq.document_type_id));
    return type?.counterpart_scope === "NONE";
  });

  if (!preferred) {
    fail("Document sequence selection", "unable to resolve preferred sequence");
    return null;
  }

  const selectedType = typesById.get(String(preferred.document_type_id));
  const customer = customers[0];
  const warehouse = warehouses[0];
  const variant = variants[0];

  ok("Document type + sequence", `${selectedType.code} (${selectedType.counterpart_scope})`);
  ok("Customer", `${customer.code ?? customer.id} - ${customer.legal_name ?? "N/A"}`);
  ok("Warehouse", `${warehouse.code ?? warehouse.id} - ${warehouse.name ?? "N/A"}`);
  ok("Variant", `${variant.variant_code ?? variant.id} - ${variant.name ?? "N/A"}`);

  return {
    documentType: selectedType,
    customer,
    warehouse,
    variant,
    today: new Date().toISOString().slice(0, 10)
  };
}

async function step4_listSales(token) {
  console.log("\n[4] List sales");
  const { status, json } = await request("GET", "/sales", null, token);
  const list = normalizeList(json);

  if (status === 200 && Array.isArray(list)) {
    ok("GET /sales", `${list.length} record(s)`);
  } else {
    fail("GET /sales", `status ${status}`);
  }
}

async function step5_createSale(token, ctx) {
  console.log("\n[5] Create sale");

  const payload = {
    document_type_id: Number(ctx.documentType.id),
    document_date: ctx.today,
    warehouse_id: Number(ctx.warehouse.id),
    customer_id: Number(ctx.customer.id),
    status: "DRAFT",
    notes: "Smoke test sale",
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

  const { status, json } = await request("POST", "/sales", payload, token);
  if (status === 201 && json?.id) {
    ok("POST /sales", `id=${json.id}, number=${json.document_number_label}`);
    return json;
  }

  fail("POST /sales", json?.message ?? `status ${status}`);
  return null;
}

async function step6_getById(token, saleId) {
  console.log("\n[6] Get sale by ID");
  const { status, json } = await request("GET", `/sales/${saleId}`, null, token);

  if (status === 200 && String(json?.id) === String(saleId)) {
    const detailsCount = Array.isArray(json?.details) ? json.details.length : 0;
    ok(`GET /sales/${saleId}`, `status=${json.status}, details=${detailsCount}`);
  } else {
    fail(`GET /sales/${saleId}`, json?.message ?? `status ${status}`);
  }
}

async function step7_filters(token, sale, today) {
  console.log("\n[7] Validate filters");

  const statusRes = await request("GET", "/sales?status=DRAFT", null, token);
  const statusList = normalizeList(statusRes.json);
  const inStatusFilter = statusList.some((row) => String(row.id) === String(sale.id));
  inStatusFilter
    ? ok("GET /sales?status=DRAFT includes created sale")
    : fail("GET /sales?status=DRAFT includes created sale", `status=${statusRes.status}`);

  const partnerTerm = (sale.customer_name ?? sale.partner_name ?? "").split(" ")[0]?.trim() || "";
  const partnerRes = await request("GET", `/sales?partner_name=${encodeURIComponent(partnerTerm)}`, null, token);
  const partnerList = normalizeList(partnerRes.json);
  const inPartnerFilter = partnerList.some((row) => String(row.id) === String(sale.id));
  inPartnerFilter
    ? ok("GET /sales?partner_name=... includes created sale")
    : fail("GET /sales?partner_name=... includes created sale", `status=${partnerRes.status}`);

  const dateRes = await request("GET", `/sales?date_from=${today}&date_to=${today}`, null, token);
  const dateList = normalizeList(dateRes.json);
  const inDateFilter = dateList.some((row) => String(row.id) === String(sale.id));
  inDateFilter
    ? ok("GET /sales date range includes created sale")
    : fail("GET /sales date range includes created sale", `status=${dateRes.status}`);
}

async function step8_detailValidation(token, ctx) {
  console.log("\n[8] Validate detail payload errors");

  const invalidPayload = {
    document_type_id: Number(ctx.documentType.id),
    document_date: ctx.today,
    warehouse_id: Number(ctx.warehouse.id),
    customer_id: Number(ctx.customer.id),
    status: "DRAFT",
    details: [
      {
        product_variant_id: Number(ctx.variant.id),
        warehouse_id: Number(ctx.warehouse.id),
        quantity: 0,
        unit_price: 1000,
        discount_amount: 0,
        tax_amount: 0
      }
    ]
  };

  const { status, json } = await request("POST", "/sales", invalidPayload, token);

  if (status === 400) {
    ok("POST /sales invalid detail returns 400");
  } else {
    fail("POST /sales invalid detail", json?.message ?? `expected 400, got ${status}`);
  }
}

async function step9_updateSale(token, saleId, ctx) {
  console.log("\n[9] Update sale");

  const payload = {
    status: "CONFIRMED",
    notes: "Smoke test sale confirmed",
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

  const { status, json } = await request("PUT", `/sales/${saleId}`, payload, token);
  if (status === 200 && json?.status === "CONFIRMED") {
    ok(`PUT /sales/${saleId}`, `total=${json.total}`);
  } else {
    fail(`PUT /sales/${saleId}`, json?.message ?? `status ${status}`);
  }
}

async function step10_deleteSale(token, saleId) {
  console.log("\n[10] Delete sale");
  const { status } = await request("DELETE", `/sales/${saleId}`, null, token);
  if (status === 204 || status === 200) {
    ok(`DELETE /sales/${saleId}`);
  } else {
    fail(`DELETE /sales/${saleId}`, `status ${status}`);
  }
}

async function step11_verifyDeleted(token, saleId) {
  console.log("\n[11] Verify deleted sale");

  const listRes = await request("GET", "/sales", null, token);
  const list = normalizeList(listRes.json);
  const stillInList = list.some((row) => String(row.id) === String(saleId));

  stillInList
    ? fail("Deleted sale absent from list", "still visible")
    : ok("Deleted sale absent from list");

  const getRes = await request("GET", `/sales/${saleId}`, null, token);
  if (getRes.status === 404) {
    ok(`GET /sales/${saleId} after delete`, "404 expected");
  } else {
    fail(`GET /sales/${saleId} after delete`, `expected 404, got ${getRes.status}`);
  }
}

function printSummary() {
  const total = passed + failed;
  console.log("\n==============================================");
  console.log(`Sales smoke: ${passed}/${total} passed`);
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
  console.log("Sales Module - E2E Smoke Test");
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

  await step4_listSales(token);

  const sale = await step5_createSale(token, ctx);
  if (!sale?.id) {
    console.log("\nSkipping remaining CRUD steps due to create failure.");
    printSummary();
    return;
  }

  await step6_getById(token, sale.id);
  await step7_filters(token, sale, ctx.today);
  await step8_detailValidation(token, ctx);
  await step9_updateSale(token, sale.id, ctx);
  await step10_deleteSale(token, sale.id);
  await step11_verifyDeleted(token, sale.id);

  printSummary();
}

run().catch((err) => {
  console.error("Unhandled error:", err?.message ?? err);
  process.exitCode = 1;
});
