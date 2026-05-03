-- Audit + remediation for historical CONFIRMED documents that should have inventory movements.
-- MySQL 8+
--
-- What this script does:
-- 1) Detects lines in CONFIRMED documents (affects_inventory = 1) with missing movement records.
-- 2) Classifies root cause: missing warehouse vs missing movement.
-- 3) Inserts missing movements in an idempotent way (only for rows with effective warehouse).
--
-- Important:
-- - Review result sets before running remediation INSERT.
-- - Run on a backup/staging first.
-- - Keep transaction open until validation is complete.

SET @company_id := NULL; -- NULL = all companies. Example: 2

-- ============================================================================
-- A) AUDIT: line-level expected movement and root-cause classification
-- ============================================================================
WITH expected_lines AS (
  SELECT
    d.id AS document_id,
    d.company_id,
    d.document_type_id,
    dt.code AS document_type_code,
    dt.counterpart_scope,
    d.status,
    d.created_by,
    COALESCE(d.confirmed_at, d.document_date, UTC_TIMESTAMP()) AS expected_movement_date,
    dd.id AS document_detail_id,
    dd.line_number,
    dd.product_variant_id,
    COALESCE(dd.warehouse_id, d.warehouse_id) AS effective_warehouse_id,
    dd.quantity,
    dd.unit_price,
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
    AND (@company_id IS NULL OR d.company_id = @company_id)
), expected_with_type AS (
  SELECT
    el.*,
    mt.id AS expected_movement_type_id
  FROM expected_lines el
  LEFT JOIN inventory_movement_types mt
    ON mt.code = el.expected_movement_code
), line_movement_presence AS (
  SELECT
    ewt.*,
    EXISTS (
      SELECT 1
      FROM inventory_movements im
      WHERE im.company_id = ewt.company_id
        AND im.source_document_type = 'DOCUMENT'
        AND im.source_document_id = ewt.document_id
        AND im.product_variant_id = ewt.product_variant_id
        AND im.warehouse_id = ewt.effective_warehouse_id
        AND im.movement_type_id = ewt.expected_movement_type_id
    ) AS movement_exists
  FROM expected_with_type ewt
)
SELECT
  lmp.company_id,
  lmp.document_id,
  lmp.document_type_code,
  lmp.document_detail_id,
  lmp.line_number,
  lmp.product_variant_id,
  lmp.effective_warehouse_id,
  lmp.quantity,
  lmp.expected_movement_code,
  lmp.expected_movement_type_id,
  CASE
    WHEN lmp.expected_movement_type_id IS NULL THEN 'MISSING_MOVEMENT_TYPE'
    WHEN lmp.effective_warehouse_id IS NULL THEN 'NO_EFFECTIVE_WAREHOUSE'
    WHEN lmp.movement_exists = 0 THEN 'NO_MOVEMENT_REGISTERED'
    ELSE 'OK'
  END AS audit_status
FROM line_movement_presence lmp
ORDER BY lmp.company_id, lmp.document_id, lmp.line_number;

-- ============================================================================
-- B) AUDIT SUMMARY
-- ============================================================================
WITH expected_lines AS (
  SELECT
    d.id AS document_id,
    d.company_id,
    dt.code AS document_type_code,
    dt.counterpart_scope,
    dd.id AS document_detail_id,
    dd.product_variant_id,
    COALESCE(dd.warehouse_id, d.warehouse_id) AS effective_warehouse_id,
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
    AND (@company_id IS NULL OR d.company_id = @company_id)
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
SELECT
  audit_status,
  COUNT(*) AS rows_count
FROM classified
GROUP BY audit_status
ORDER BY rows_count DESC;

-- ============================================================================
-- C) DRY-RUN REMEDIATION PREVIEW (only rows that can be remediated safely)
-- ============================================================================
WITH missing_rows AS (
  SELECT
    d.id AS document_id,
    d.company_id,
    d.created_by,
    COALESCE(d.confirmed_at, d.document_date, UTC_TIMESTAMP()) AS movement_date,
    dd.id AS document_detail_id,
    dd.product_variant_id,
    COALESCE(dd.warehouse_id, d.warehouse_id) AS warehouse_id,
    dd.quantity,
    dd.unit_price,
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
    END AS movement_code
  FROM documents d
  JOIN document_types dt ON dt.id = d.document_type_id
  JOIN document_details dd ON dd.document_id = d.id
  WHERE d.deleted_at IS NULL
    AND d.status = 'CONFIRMED'
    AND dt.affects_inventory = 1
    AND (@company_id IS NULL OR d.company_id = @company_id)
), candidates AS (
  SELECT
    mr.*,
    mt.id AS movement_type_id
  FROM missing_rows mr
  JOIN inventory_movement_types mt ON mt.code = mr.movement_code
  WHERE mr.warehouse_id IS NOT NULL
)
SELECT
  c.company_id,
  c.document_id,
  c.document_detail_id,
  c.product_variant_id,
  c.warehouse_id,
  c.quantity,
  c.movement_code,
  c.movement_type_id,
  c.unit_price AS unit_cost,
  c.movement_date,
  c.created_by,
  'REMEDIATION_MISSING_DOCUMENT_MOVEMENT' AS reason
FROM candidates c
WHERE NOT EXISTS (
  SELECT 1
  FROM inventory_movements im
  WHERE im.company_id = c.company_id
    AND im.source_document_type = 'DOCUMENT'
    AND im.source_document_id = c.document_id
    AND im.product_variant_id = c.product_variant_id
    AND im.warehouse_id = c.warehouse_id
    AND im.movement_type_id = c.movement_type_id
)
ORDER BY c.company_id, c.document_id, c.document_detail_id;

-- ============================================================================
-- D) REMEDIATION INSERT (IDEMPOTENT)
-- Uncomment and execute only after reviewing section C.
-- ============================================================================
/*
START TRANSACTION;

WITH missing_rows AS (
  SELECT
    d.id AS document_id,
    d.company_id,
    d.created_by,
    COALESCE(d.confirmed_at, d.document_date, UTC_TIMESTAMP()) AS movement_date,
    dd.id AS document_detail_id,
    dd.product_variant_id,
    COALESCE(dd.warehouse_id, d.warehouse_id) AS warehouse_id,
    dd.quantity,
    dd.unit_price,
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
    END AS movement_code
  FROM documents d
  JOIN document_types dt ON dt.id = d.document_type_id
  JOIN document_details dd ON dd.document_id = d.id
  WHERE d.deleted_at IS NULL
    AND d.status = 'CONFIRMED'
    AND dt.affects_inventory = 1
    AND (@company_id IS NULL OR d.company_id = @company_id)
), candidates AS (
  SELECT
    mr.*,
    mt.id AS movement_type_id
  FROM missing_rows mr
  JOIN inventory_movement_types mt ON mt.code = mr.movement_code
  WHERE mr.warehouse_id IS NOT NULL
)
INSERT INTO inventory_movements (
  company_id,
  movement_type_id,
  warehouse_id,
  related_warehouse_id,
  product_variant_id,
  quantity,
  unit_cost,
  movement_date,
  reason,
  source_document_type,
  source_document_id,
  created_at,
  created_by
)
SELECT
  c.company_id,
  c.movement_type_id,
  c.warehouse_id,
  NULL,
  c.product_variant_id,
  c.quantity,
  c.unit_price,
  c.movement_date,
  'REMEDIATION_MISSING_DOCUMENT_MOVEMENT',
  'DOCUMENT',
  c.document_id,
  UTC_TIMESTAMP(),
  c.created_by
FROM candidates c
WHERE NOT EXISTS (
  SELECT 1
  FROM inventory_movements im
  WHERE im.company_id = c.company_id
    AND im.source_document_type = 'DOCUMENT'
    AND im.source_document_id = c.document_id
    AND im.product_variant_id = c.product_variant_id
    AND im.warehouse_id = c.warehouse_id
    AND im.movement_type_id = c.movement_type_id
);

-- Post-check: should reduce NO_MOVEMENT_REGISTERED to 0 for remediable rows.
-- Run section B again before COMMIT.

COMMIT;
-- ROLLBACK;
*/
