import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DECIMALS = 4;

function toNum(value) {
  return Number(value ?? 0);
}

function fmt(value) {
  return toNum(value).toFixed(DECIMALS);
}

function assertClose(actual, expected, label) {
  const a = toNum(actual);
  const e = toNum(expected);
  if (Math.abs(a - e) > 0.0001) {
    throw new Error(`${label} expected=${fmt(e)} actual=${fmt(a)}`);
  }
}

class IntentionalRollback extends Error {
  constructor(message = 'Intentional rollback to keep DB clean') {
    super(message);
    this.name = 'IntentionalRollback';
  }
}

async function getBaseRefs(tx, options = {}) {
  const { requireSaleContext = false } = options;
  const company = await tx.companies.findFirst({ orderBy: { id: 'asc' } });
  if (!company) throw new Error('No company found');

  const warehouses = await tx.warehouses.findMany({
    where: { company_id: company.id, deleted_at: null },
    orderBy: { id: 'asc' },
    take: 2
  });
  if (warehouses.length < 2) throw new Error('At least 2 warehouses are required');

  const variant = await tx.product_variants.findFirst({
    where: { company_id: company.id, deleted_at: null },
    orderBy: { id: 'asc' }
  });
  if (!variant) throw new Error('No product_variant found');

  const user = await tx.users.findFirst({
    where: { company_id: company.id, deleted_at: null },
    orderBy: { id: 'asc' }
  });

  const customer = await tx.customers.findFirst({
    where: { company_id: company.id, deleted_at: null },
    orderBy: { id: 'asc' }
  });

  const supplier = await tx.suppliers.findFirst({
    where: { company_id: company.id, deleted_at: null },
    orderBy: { id: 'asc' }
  });

  const terminal = await tx.pos_terminals.findFirst({
    where: {
      company_id: company.id,
      deleted_at: null,
      cash_registers: {
        some: { deleted_at: null }
      }
    },
    orderBy: { id: 'asc' }
  }) ?? await tx.pos_terminals.findFirst({
    where: { company_id: company.id, deleted_at: null },
    orderBy: { id: 'asc' }
  });
  if (!terminal) throw new Error('No POS terminal found');

  const cashOpening = await tx.cash_openings.findFirst({
    where: {
      company_id: company.id,
      cash_registers: { terminal_id: terminal.id },
      status: 'OPEN'
    },
    orderBy: { id: 'asc' }
  });

  let effectiveCashOpening = cashOpening;

  if (requireSaleContext && !effectiveCashOpening) {
    const cashRegister = await tx.cash_registers.findFirst({
      where: {
        company_id: company.id,
        terminal_id: terminal.id,
        deleted_at: null
      },
      orderBy: { id: 'asc' }
    });

    if (!cashRegister) {
      throw new Error('No cash register found for terminal; cannot create OPEN cash opening for sale scenario.');
    }

    if (!user?.id) {
      throw new Error('No active user found to create temporary OPEN cash opening for sale scenario.');
    }

    effectiveCashOpening = await tx.cash_openings.create({
      data: {
        company_id: company.id,
        cash_register_id: cashRegister.id,
        user_id: user.id,
        opening_amount: 100000,
        note: 'SMOKE_TEMP_OPENING',
        status: 'OPEN'
      }
    });
  }

  return {
    company,
    warehouseA: warehouses[0],
    warehouseB: warehouses[1],
    variant,
    user,
    customer,
    supplier,
    terminal,
    cashOpening: effectiveCashOpening
  };
}

async function getMovementTypeId(tx, code) {
  const row = await tx.inventory_movement_types.findUnique({ where: { code } });
  if (!row) throw new Error(`Missing movement type code: ${code}`);
  return row.id;
}

async function ensureInventoryBaseline(tx, { companyId, warehouseId, variantId, baseline = 30 }) {
  const existing = await tx.inventory.findUnique({
    where: {
      company_id_warehouse_id_product_variant_id: {
        company_id: companyId,
        warehouse_id: warehouseId,
        product_variant_id: variantId
      }
    }
  });

  if (!existing) {
    await tx.inventory.create({
      data: {
        company_id: companyId,
        warehouse_id: warehouseId,
        product_variant_id: variantId,
        quantity_on_hand: baseline,
        quantity_reserved: 0,
        min_stock: 0,
        max_stock: null,
        reorder_point: null
      }
    });
  } else {
    await tx.inventory.update({
      where: { id: existing.id },
      data: {
        quantity_on_hand: baseline,
        quantity_reserved: 0,
        min_stock: existing.min_stock,
        max_stock: existing.max_stock,
        reorder_point: existing.reorder_point
      }
    });
  }
}

async function getOnHand(tx, companyId, warehouseId, variantId) {
  const row = await tx.inventory.findUnique({
    where: {
      company_id_warehouse_id_product_variant_id: {
        company_id: companyId,
        warehouse_id: warehouseId,
        product_variant_id: variantId
      }
    }
  });
  return toNum(row?.quantity_on_hand ?? 0);
}

function totalWithTax(quantity, unitPrice, taxRate = 0.19) {
  const subtotal = quantity * unitPrice;
  const tax = +(subtotal * taxRate).toFixed(4);
  return { subtotal: +subtotal.toFixed(4), tax, total: +(subtotal + tax).toFixed(4) };
}

async function runScenario(name, fn) {
  process.stdout.write(`\n[SCENARIO] ${name}\n`);
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
      throw new IntentionalRollback();
    }, { timeout: 20000 });
    process.stdout.write('  [FAIL] Scenario finished without rollback sentinel\n');
    return false;
  } catch (err) {
    if (err instanceof IntentionalRollback) {
      process.stdout.write('  [PASS] Scenario validated and rolled back cleanly\n');
      return true;
    }
    process.stdout.write(`  [FAIL] ${err.message}\n`);
    return false;
  }
}

async function scenarioAdjustment(tx) {
  const refs = await getBaseRefs(tx);
  await ensureInventoryBaseline(tx, {
    companyId: refs.company.id,
    warehouseId: refs.warehouseA.id,
    variantId: refs.variant.id,
    baseline: 30
  });

  const adjustIn = await getMovementTypeId(tx, 'ADJUST_IN');
  const adjustOut = await getMovementTypeId(tx, 'ADJUST_OUT');

  const before = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);

  await tx.inventory_movements.create({
    data: {
      company_id: refs.company.id,
      movement_type_id: adjustIn,
      warehouse_id: refs.warehouseA.id,
      product_variant_id: refs.variant.id,
      quantity: 5,
      unit_cost: 0,
      reason: 'SMOKE_ADJUST_IN',
      source_document_type: 'SMOKE',
      source_document_id: null,
      created_by: refs.user?.id ?? null
    }
  });

  await tx.inventory_movements.create({
    data: {
      company_id: refs.company.id,
      movement_type_id: adjustOut,
      warehouse_id: refs.warehouseA.id,
      product_variant_id: refs.variant.id,
      quantity: 2,
      unit_cost: 0,
      reason: 'SMOKE_ADJUST_OUT',
      source_document_type: 'SMOKE',
      source_document_id: null,
      created_by: refs.user?.id ?? null
    }
  });

  const after = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  assertClose(after, before + 3, 'Adjustment net stock');
}

async function scenarioTransfer(tx) {
  const refs = await getBaseRefs(tx);
  await ensureInventoryBaseline(tx, {
    companyId: refs.company.id,
    warehouseId: refs.warehouseA.id,
    variantId: refs.variant.id,
    baseline: 30
  });
  await ensureInventoryBaseline(tx, {
    companyId: refs.company.id,
    warehouseId: refs.warehouseB.id,
    variantId: refs.variant.id,
    baseline: 10
  });

  const transfer = await getMovementTypeId(tx, 'TRANSFER');

  const beforeA = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  const beforeB = await getOnHand(tx, refs.company.id, refs.warehouseB.id, refs.variant.id);

  await tx.inventory_movements.create({
    data: {
      company_id: refs.company.id,
      movement_type_id: transfer,
      warehouse_id: refs.warehouseA.id,
      related_warehouse_id: refs.warehouseB.id,
      product_variant_id: refs.variant.id,
      quantity: 4,
      unit_cost: 0,
      reason: 'SMOKE_TRANSFER',
      source_document_type: 'SMOKE',
      source_document_id: null,
      created_by: refs.user?.id ?? null
    }
  });

  const afterA = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  const afterB = await getOnHand(tx, refs.company.id, refs.warehouseB.id, refs.variant.id);
  assertClose(afterA, beforeA - 4, 'Transfer source stock');
  assertClose(afterB, beforeB + 4, 'Transfer destination stock');
}

function pickDocTypes(docTypes) {
  let purchase = null;
  let customerReturn = null;

  for (const t of docTypes) {
    const code = String(t.code || '').toUpperCase();
    if (!purchase && t.counterpart_scope === 'SUPPLIER' && !/DEV|RETURN|CREDIT|NC/.test(code)) {
      purchase = t;
    }
    if (!customerReturn && t.counterpart_scope === 'CUSTOMER' && /DEV|RETURN|CREDIT|NC/.test(code)) {
      customerReturn = t;
    }
  }

  return { purchase, customerReturn };
}

async function ensureDocumentTypeAndSequence(tx, refs, { code, name, counterpart_scope }) {
  let docType = await tx.document_types.findFirst({
    where: {
      code,
      deleted_at: null
    }
  });

  if (!docType) {
    docType = await tx.document_types.create({
      data: {
        code,
        name,
        counterpart_scope,
        affects_inventory: true,
        affects_accounting: false
      }
    });
  }

  const year = new Date().getUTCFullYear();
  const seq = await tx.document_sequences.findUnique({
    where: {
      company_id_document_type_id_year_num: {
        company_id: refs.company.id,
        document_type_id: docType.id,
        year_num: year
      }
    }
  });

  if (!seq) {
    await tx.document_sequences.create({
      data: {
        company_id: refs.company.id,
        document_type_id: docType.id,
        year_num: year,
        next_number: 900000
      }
    });
  }

  return docType;
}

async function createDocumentWithDetail(tx, refs, docType, quantity, unitPrice) {
  const now = new Date();
  const year = now.getUTCFullYear();

  const seq = await tx.document_sequences.findUnique({
    where: {
      company_id_document_type_id_year_num: {
        company_id: refs.company.id,
        document_type_id: docType.id,
        year_num: year
      }
    }
  });

  if (!seq) {
    throw new Error(`Missing document sequence for type ${docType.code} year=${year}`);
  }

  const totals = totalWithTax(quantity, unitPrice);
  const next = seq.next_number;

  const doc = await tx.documents.create({
    data: {
      company_id: refs.company.id,
      document_type_id: docType.id,
      sequence_number: next,
      document_date: now,
      warehouse_id: refs.warehouseA.id,
      customer_id: docType.counterpart_scope === 'CUSTOMER' ? (refs.customer?.id ?? null) : null,
      supplier_id: docType.counterpart_scope === 'SUPPLIER' ? (refs.supplier?.id ?? null) : null,
      status: 'DRAFT',
      subtotal: totals.subtotal,
      tax_total: totals.tax,
      discount_total: 0,
      total: totals.total,
      notes: `SMOKE_DOC_${docType.code}`,
      created_by: refs.user?.id ?? null
    }
  });

  await tx.document_sequences.update({
    where: { id: seq.id },
    data: { next_number: { increment: 1 } }
  });

  await tx.document_details.create({
    data: {
      company_id: refs.company.id,
      document_id: doc.id,
      line_number: 1,
      product_variant_id: refs.variant.id,
      warehouse_id: refs.warehouseA.id,
      quantity,
      unit_price: unitPrice,
      discount_amount: 0,
      tax_amount: totals.tax,
      line_total: totals.total
    }
  });

  return doc;
}

async function scenarioPurchaseAndReturn(tx) {
  const refs = await getBaseRefs(tx);
  if (!refs.supplier) throw new Error('No supplier found for purchase document');
  if (!refs.customer) throw new Error('No customer found for return document');

  await ensureInventoryBaseline(tx, {
    companyId: refs.company.id,
    warehouseId: refs.warehouseA.id,
    variantId: refs.variant.id,
    baseline: 40
  });

  const docTypes = await tx.document_types.findMany({
    where: { affects_inventory: true, deleted_at: null }
  });

  let { purchase, customerReturn } = pickDocTypes(docTypes);

  if (!purchase) {
    purchase = await ensureDocumentTypeAndSequence(tx, refs, {
      code: 'SMK_PURCHASE',
      name: 'Smoke Purchase',
      counterpart_scope: 'SUPPLIER'
    });
  }

  if (!customerReturn) {
    customerReturn = await ensureDocumentTypeAndSequence(tx, refs, {
      code: 'SMK_RETURN_CUST',
      name: 'Smoke Return Customer',
      counterpart_scope: 'CUSTOMER'
    });
  }

  const before = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);

  const purchaseDoc = await createDocumentWithDetail(tx, refs, purchase, 6, 1000);
  await tx.documents.update({
    where: { id: purchaseDoc.id },
    data: { status: 'CONFIRMED', confirmed_at: new Date() }
  });

  const afterPurchase = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  assertClose(afterPurchase, before + 6, 'Purchase confirm stock increase');

  const returnDoc = await createDocumentWithDetail(tx, refs, customerReturn, 2, 1000);
  await tx.documents.update({
    where: { id: returnDoc.id },
    data: { status: 'CONFIRMED', confirmed_at: new Date() }
  });

  const afterReturn = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  assertClose(afterReturn, afterPurchase + 2, 'Customer return stock increase');
}

async function scenarioSaleConfirmCancel(tx) {
  const refs = await getBaseRefs(tx, { requireSaleContext: true });
  await ensureInventoryBaseline(tx, {
    companyId: refs.company.id,
    warehouseId: refs.warehouseA.id,
    variantId: refs.variant.id,
    baseline: 50
  });

  const before = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);

  const saleTotals = totalWithTax(3, 1500);
  const sale = await tx.sales.create({
    data: {
      company_id: refs.company.id,
      cash_opening_id: refs.cashOpening.id,
      terminal_id: refs.terminal.id,
      customer_id: refs.customer?.id ?? null,
      document_id: null,
      sold_at: new Date(),
      status: 'PENDING',
      subtotal: saleTotals.subtotal,
      tax_total: saleTotals.tax,
      discount_total: 0,
      total: saleTotals.total,
      created_by: refs.user?.id ?? null
    }
  });

  await tx.sale_details.create({
    data: {
      company_id: refs.company.id,
      sale_id: sale.id,
      line_number: 1,
      warehouse_id: refs.warehouseA.id,
      product_variant_id: refs.variant.id,
      quantity: 3,
      unit_price: 1500,
      discount_amount: 0,
      tax_amount: saleTotals.tax,
      line_total: saleTotals.total
    }
  });

  await tx.sales.update({
    where: { id: sale.id },
    data: { status: 'CONFIRMED' }
  });

  const afterConfirm = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  assertClose(afterConfirm, before - 3, 'Sale confirm stock decrease');

  await tx.sales.update({
    where: { id: sale.id },
    data: { status: 'CANCELLED' }
  });

  const afterCancel = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  assertClose(afterCancel, before, 'Sale cancel stock restore');
}

async function scenarioNegativeRollback(tx) {
  const refs = await getBaseRefs(tx);
  await ensureInventoryBaseline(tx, {
    companyId: refs.company.id,
    warehouseId: refs.warehouseA.id,
    variantId: refs.variant.id,
    baseline: 1
  });

  const outType = await getMovementTypeId(tx, 'STOCK_OUT');

  let failedAsExpected = false;
  try {
    await tx.inventory_movements.create({
      data: {
        company_id: refs.company.id,
        movement_type_id: outType,
        warehouse_id: refs.warehouseA.id,
        product_variant_id: refs.variant.id,
        quantity: 5,
        unit_cost: 0,
        reason: 'SMOKE_NEGATIVE_STOCK',
        source_document_type: 'SMOKE',
        source_document_id: null,
        created_by: refs.user?.id ?? null
      }
    });
  } catch {
    failedAsExpected = true;
  }

  if (!failedAsExpected) {
    throw new Error('Negative stock movement did not fail as expected');
  }

  const after = await getOnHand(tx, refs.company.id, refs.warehouseA.id, refs.variant.id);
  assertClose(after, 1, 'Negative-stock rollback preserves baseline');
}

async function run() {
  const scenarios = [
    ['Adjustment (ADJUST_IN/ADJUST_OUT)', scenarioAdjustment],
    ['Transfer between warehouses', scenarioTransfer],
    ['Purchase + customer return (documents)', scenarioPurchaseAndReturn],
    ['POS sale confirm + cancel', scenarioSaleConfirmCancel],
    ['Automatic rollback on negative stock', scenarioNegativeRollback]
  ];

  let pass = 0;
  let fail = 0;

  for (const [name, fn] of scenarios) {
    const ok = await runScenario(name, fn);
    if (ok) pass += 1;
    else fail += 1;
  }

  process.stdout.write(`\n=== Inventory Automation Smoke Summary ===\n`);
  process.stdout.write(`PASS: ${pass}\n`);
  process.stdout.write(`FAIL: ${fail}\n`);

  await prisma.$disconnect();

  if (fail > 0) {
    process.exit(1);
  }
}

run().catch(async (err) => {
  process.stderr.write(`${err.message}\n`);
  await prisma.$disconnect();
  process.exit(1);
});
