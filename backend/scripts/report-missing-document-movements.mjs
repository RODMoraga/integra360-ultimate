import { PrismaClient } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

function toSqlDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function sqlValue(value, { numeric = false } = {}) {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof Date) return `'${toSqlDate(value)}'`;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  const asString = String(value);
  if (numeric && /^-?\d+(\.\d+)?$/.test(asString)) {
    return asString;
  }
  return `'${asString.replace(/'/g, "''")}'`;
}

function normalizeCompanyArg() {
  const arg = process.argv[2];
  if (!arg || arg.toLowerCase() === 'all') {
    return null;
  }

  const parsed = Number(arg);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('company_id inválido. Usa un entero positivo o "all".');
  }

  return parsed;
}

async function run() {
  const companyId = normalizeCompanyArg();
  const companyFilter = companyId === null ? '' : ` AND d.company_id = ${companyId}`;

  const baseCte = `
WITH expected_lines AS (
  SELECT
    d.id AS document_id,
    d.company_id,
    dt.code AS document_type_code,
    dd.id AS document_detail_id,
    dd.product_variant_id,
    COALESCE(dd.warehouse_id, d.warehouse_id) AS effective_warehouse_id,
    dd.quantity,
    dd.unit_price,
    d.created_by,
    COALESCE(d.confirmed_at, d.document_date, UTC_TIMESTAMP()) AS movement_date,
    CASE
      WHEN (
        CASE
          WHEN UPPER(dt.code) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
            CASE
              WHEN dt.counterpart_scope = 'SUPPLIER' THEN 'OUT'
              WHEN dt.counterpart_scope = 'CUSTOMER' THEN 'IN'
              ELSE 'OUT'
            END
          ELSE
            CASE
              WHEN dt.counterpart_scope = 'SUPPLIER' THEN 'IN'
              WHEN dt.counterpart_scope = 'CUSTOMER' THEN 'OUT'
              ELSE 'IN'
            END
        END
      ) = 'IN' THEN 'STOCK_IN' ELSE 'STOCK_OUT'
    END AS expected_movement_code
  FROM documents d
  JOIN document_types dt ON dt.id = d.document_type_id
  JOIN document_details dd ON dd.document_id = d.id
  WHERE d.deleted_at IS NULL
    AND d.status = 'CONFIRMED'
    AND dt.affects_inventory = 1
    ${companyFilter}
), expected_with_type AS (
  SELECT
    el.*,
    mt.id AS expected_movement_type_id
  FROM expected_lines el
  LEFT JOIN inventory_movement_types mt
    ON mt.code = el.expected_movement_code
), classified AS (
  SELECT
    ewt.*,
    CASE
      WHEN ewt.expected_movement_type_id IS NULL THEN 'MISSING_MOVEMENT_TYPE'
      WHEN ewt.effective_warehouse_id IS NULL THEN 'NO_EFFECTIVE_WAREHOUSE'
      WHEN EXISTS (
        SELECT 1
        FROM inventory_movements im
        WHERE im.company_id = ewt.company_id
          AND im.source_document_type = 'DOCUMENT'
          AND im.source_document_id = ewt.document_id
          AND im.product_variant_id = ewt.product_variant_id
          AND im.warehouse_id = ewt.effective_warehouse_id
          AND im.movement_type_id = ewt.expected_movement_type_id
      ) THEN 'OK'
      ELSE 'NO_MOVEMENT_REGISTERED'
    END AS audit_status
  FROM expected_with_type ewt
)
`;

  const summary = await prisma.$queryRawUnsafe(`${baseCte}
SELECT audit_status, COUNT(*) AS rows_count
FROM classified
GROUP BY audit_status
ORDER BY rows_count DESC;`);

  const affectedDocs = await prisma.$queryRawUnsafe(`${baseCte}
SELECT DISTINCT company_id, document_id, audit_status
FROM classified
WHERE audit_status <> 'OK'
ORDER BY company_id, document_id;`);

  const remediableRows = await prisma.$queryRawUnsafe(`${baseCte}
SELECT
  company_id,
  document_id,
  product_variant_id,
  effective_warehouse_id AS warehouse_id,
  expected_movement_type_id AS movement_type_id,
  quantity,
  unit_price,
  movement_date,
  created_by
FROM classified c
WHERE c.audit_status = 'NO_MOVEMENT_REGISTERED'
  AND c.effective_warehouse_id IS NOT NULL
  AND c.expected_movement_type_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM inventory_movements im
    WHERE im.company_id = c.company_id
      AND im.source_document_type = 'DOCUMENT'
      AND im.source_document_id = c.document_id
      AND im.product_variant_id = c.product_variant_id
      AND im.warehouse_id = c.effective_warehouse_id
      AND im.movement_type_id = c.expected_movement_type_id
  )
ORDER BY company_id, document_id;`);

  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const scopeTag = companyId === null ? 'all' : `company-${companyId}`;
  const reportPath = path.resolve('prisma', `audit-report-missing-document-movements-${scopeTag}-${dateTag}.json`);
  const remediationPath = path.resolve('prisma', `remediation-batch-missing-document-movements-${scopeTag}-${dateTag}.sql`);

  const reportPayload = {
    generated_at_utc: new Date().toISOString(),
    scope: companyId === null ? 'all_companies' : `company_${companyId}`,
    summary,
    affected_documents_count: affectedDocs.length,
    affected_documents: affectedDocs,
    remediable_rows_count: remediableRows.length,
    remediable_rows_preview: remediableRows.slice(0, 50)
  };

  await fs.writeFile(reportPath, JSON.stringify(reportPayload, null, 2), 'utf8');

  if (remediableRows.length === 0) {
    await fs.writeFile(
      remediationPath,
      '-- No remediable rows were found.\n-- Audit report indicates there is nothing to insert for NO_MOVEMENT_REGISTERED.\n',
      'utf8'
    );
  } else {
    const values = remediableRows.map((row) => `(
  ${sqlValue(row.company_id, { numeric: true })},
  ${sqlValue(row.movement_type_id, { numeric: true })},
  ${sqlValue(row.warehouse_id, { numeric: true })},
  NULL,
  ${sqlValue(row.product_variant_id, { numeric: true })},
  ${sqlValue(row.quantity, { numeric: true })},
  ${sqlValue(row.unit_price, { numeric: true })},
  ${sqlValue(row.movement_date)},
  'REMEDIATION_MISSING_DOCUMENT_MOVEMENT',
  'DOCUMENT',
  ${sqlValue(row.document_id, { numeric: true })},
  UTC_TIMESTAMP(),
  ${sqlValue(row.created_by, { numeric: true })}
)`).join(',\n');

    const remediationSql = `-- Generated remediation batch for missing inventory movements from CONFIRMED documents\n-- Generated at UTC: ${new Date().toISOString()}\n\nSTART TRANSACTION;\n\nINSERT INTO inventory_movements (\n  company_id,\n  movement_type_id,\n  warehouse_id,\n  related_warehouse_id,\n  product_variant_id,\n  quantity,\n  unit_cost,\n  movement_date,\n  reason,\n  source_document_type,\n  source_document_id,\n  created_at,\n  created_by\n) VALUES\n${values};\n\n-- Validate summary after insert using the audit SQL script, then commit if OK.\nCOMMIT;\n-- ROLLBACK;\n`;

    await fs.writeFile(remediationPath, remediationSql, 'utf8');
  }

  console.log(`Report generated: ${reportPath}`);
  console.log(`Remediation batch generated: ${remediationPath}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
