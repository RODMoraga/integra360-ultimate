import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const COMPANY_ID = 2n;

const DEMO_CODES = {
  uom: ['GRM', 'TON', 'LTR', 'MLT', 'PZA', 'CAJ', 'PAQ', 'DOC', 'M2', 'CM'],
  brands: ['SAMSUNG', 'LG', 'SONY', 'BOSCH', 'MAKITA', '3M', 'HP', 'CANON', 'LENOVO', 'BROTHER'],
  models: ['GALAXY-S24', 'LG-GRAM-16', 'XPERIA-5V', 'GSB120', 'DHP453', 'SCOTCH-600', 'LJ-M404DN', 'PIXMA-G3170', 'THINKPAD-E14', 'MFC-L2750DW'],
  categories: ['CAT-ELEC', 'CAT-HERR', 'CAT-INFO', 'CAT-CONS', 'CAT-ELHO', 'CAT-FERR', 'CAT-LIMP', 'CAT-SEGR', 'CAT-AUDI', 'CAT-TELE'],
  subcategories: ['ELEC-CEL', 'ELEC-TAB', 'HERR-MAN', 'HERR-ELE', 'INFO-NB', 'INFO-IMP', 'CONS-PAP', 'FERR-TOR', 'LIMP-DET', 'SEGR-EPP'],
  suppliers: ['PRO-1003', 'PRO-1004', 'PRO-1005', 'PRO-1006', 'PRO-1007', 'PRO-1008', 'PRO-1009', 'PRO-1010', 'PRO-1011', 'PRO-1012'],
  products: ['SAMS-GS24-BLK', 'BOSCH-GSB120-KIT', 'LEN-TPE14-8256', 'HP-LJ-M404DN', 'SONY-WH1000XM5-BLK', 'CANON-G3170-KIT', 'MAKITA-DHP453-KIT', 'PAPEL-A4-80G-RES', 'GUANTE-NITRILO-M', 'DEST-PHILIPS-SET6'],
  variants: ['GS24-128-BLK', 'GS24-128-WHT', 'GSB120-KIT-STD', 'TPE14-I5-8-256', 'TPE14-I5-16-512', 'LJ-M404DN-STD', 'WH1000XM5-BLK', 'WH1000XM5-SLV', 'G3170-STD', 'DHP453-3AH-KIT', 'PAPEL-A4-80G-1R', 'PAPEL-A4-80G-10R', 'GUANTE-NIT-CAJ-M', 'GUANTE-NIT-CAJ-L', 'DEST-SET6-STD']
};

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function printOk(message) {
  process.stdout.write(`[OK] ${message}\n`);
}

function printFail(message) {
  process.stdout.write(`[FAIL] ${message}\n`);
}

async function assertCodesExist(tableName, column, codes) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT ${column} AS code FROM ${tableName} WHERE company_id = ? AND ${column} IN (${codes.map(() => '?').join(',')})`,
    Number(COMPANY_ID),
    ...codes
  );

  const found = new Set(rows.map((r) => r.code));
  const missing = codes.filter((c) => !found.has(c));
  assertCondition(missing.length === 0, `${tableName}: missing codes -> ${missing.join(', ')}`);
  printOk(`${tableName}: ${codes.length}/${codes.length} registros demo presentes`);
}

async function assertDemoProductReferences() {
  const missingRefRows = await prisma.$queryRaw`
    SELECT
      p.sku,
      (u.id IS NULL) AS missing_uom,
      (p.category_id IS NOT NULL AND c.id IS NULL) AS missing_category,
      (p.subcategory_id IS NOT NULL AND sc.id IS NULL) AS missing_subcategory,
      (p.brand_id IS NOT NULL AND b.id IS NULL) AS missing_brand,
      (p.model_id IS NOT NULL AND m.id IS NULL) AS missing_model,
      (p.category_id IS NOT NULL AND p.subcategory_id IS NOT NULL AND sc.category_id <> p.category_id) AS invalid_subcategory_parent
    FROM products p
    LEFT JOIN units_of_measure u ON u.id = p.base_uom_id AND u.company_id = p.company_id
    LEFT JOIN categories c ON c.id = p.category_id AND c.company_id = p.company_id
    LEFT JOIN subcategories sc ON sc.id = p.subcategory_id AND sc.company_id = p.company_id
    LEFT JOIN brands b ON b.id = p.brand_id AND b.company_id = p.company_id
    LEFT JOIN models m ON m.id = p.model_id AND m.company_id = p.company_id
    WHERE p.company_id = ${Number(COMPANY_ID)}
      AND p.sku IN (${Prisma.join(DEMO_CODES.products)});
  `;

  const broken = missingRefRows.filter(
    (r) =>
      Number(r.missing_uom) === 1 ||
      Number(r.missing_category) === 1 ||
      Number(r.missing_subcategory) === 1 ||
      Number(r.missing_brand) === 1 ||
      Number(r.missing_model) === 1 ||
      Number(r.invalid_subcategory_parent) === 1
  );

  assertCondition(broken.length === 0, `products: referencias inválidas detectadas en ${broken.length} registro(s)`);
  printOk('products: referencias de UoM/categoria/subcategoria/marca/modelo válidas');
}

async function assertDemoVariantReferences() {
  const rows = await prisma.$queryRaw`
    SELECT pv.variant_code
    FROM product_variants pv
    LEFT JOIN products p ON p.id = pv.product_id AND p.company_id = pv.company_id
    WHERE pv.company_id = ${Number(COMPANY_ID)}
      AND pv.variant_code IN (${Prisma.join(DEMO_CODES.variants)})
      AND p.id IS NULL;
  `;

  assertCondition(rows.length === 0, `product_variants: variantes demo huérfanas encontradas (${rows.length})`);
  printOk('product_variants: todas las variantes demo referencian productos válidos');
}

async function assertExpectedDemoCounts() {
  const [productsCount, variantsCount] = await Promise.all([
    prisma.products.count({ where: { company_id: COMPANY_ID, sku: { in: DEMO_CODES.products }, deleted_at: null } }),
    prisma.product_variants.count({ where: { company_id: COMPANY_ID, variant_code: { in: DEMO_CODES.variants }, deleted_at: null } })
  ]);

  assertCondition(productsCount === DEMO_CODES.products.length, `products: esperado=${DEMO_CODES.products.length} encontrado=${productsCount}`);
  assertCondition(variantsCount === DEMO_CODES.variants.length, `product_variants: esperado=${DEMO_CODES.variants.length} encontrado=${variantsCount}`);
  printOk(`products/product_variants: conteos demo exactos (${productsCount} productos, ${variantsCount} variantes)`);
}

async function run() {
  try {
    await assertCodesExist('units_of_measure', 'code', DEMO_CODES.uom);
    await assertCodesExist('brands', 'code', DEMO_CODES.brands);
    await assertCodesExist('models', 'code', DEMO_CODES.models);
    await assertCodesExist('categories', 'code', DEMO_CODES.categories);
    await assertCodesExist('subcategories', 'code', DEMO_CODES.subcategories);
    await assertCodesExist('suppliers', 'code', DEMO_CODES.suppliers);
    await assertCodesExist('products', 'sku', DEMO_CODES.products);
    await assertCodesExist('product_variants', 'variant_code', DEMO_CODES.variants);

    await assertExpectedDemoCounts();
    await assertDemoProductReferences();
    await assertDemoVariantReferences();

    process.stdout.write('\n[PASS] Verificación de seed de productos completada correctamente.\n');
  } catch (error) {
    printFail(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

const { Prisma } = await import('@prisma/client');
run();
