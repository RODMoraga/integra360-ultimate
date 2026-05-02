-- Inventory Automation Smoke Test (MySQL 8+)
-- Purpose:
-- 1) Validate trigger-driven stock automation in transaction-safe mode.
-- 2) Validate rollback on negative stock attempt.
-- 3) Provide two-session concurrency test steps.
--
-- Usage (single-session):
--   Run this script in a SQL client connected to the target DB.
--   It ends with ROLLBACK, so data changes are not persisted.
--
-- Usage (concurrency):
--   Follow section 6 in two SQL sessions (A and B).

SET @company_id := (
  SELECT id
  FROM companies
  ORDER BY id
  LIMIT 1
);

SET @warehouse_a := (
  SELECT id
  FROM warehouses
  WHERE company_id = @company_id AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1
);

SET @warehouse_b := (
  SELECT id
  FROM warehouses
  WHERE company_id = @company_id AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1 OFFSET 1
);

SET @variant_id := (
  SELECT id
  FROM product_variants
  WHERE company_id = @company_id AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1
);

SET @user_id := (
  SELECT id
  FROM users
  WHERE company_id = @company_id AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1
);

SET @stock_in := (SELECT id FROM inventory_movement_types WHERE code = 'STOCK_IN');
SET @stock_out := (SELECT id FROM inventory_movement_types WHERE code = 'STOCK_OUT');
SET @adjust_in := (SELECT id FROM inventory_movement_types WHERE code = 'ADJUST_IN');
SET @adjust_out := (SELECT id FROM inventory_movement_types WHERE code = 'ADJUST_OUT');
SET @transfer := (SELECT id FROM inventory_movement_types WHERE code = 'TRANSFER');

SELECT
  @company_id AS company_id,
  @warehouse_a AS warehouse_a,
  @warehouse_b AS warehouse_b,
  @variant_id AS variant_id,
  @user_id AS user_id,
  @stock_in AS stock_in,
  @stock_out AS stock_out,
  @adjust_in AS adjust_in,
  @adjust_out AS adjust_out,
  @transfer AS transfer;

START TRANSACTION;

-- 1) Baseline inventory rows for tests
INSERT INTO inventory (
  company_id, warehouse_id, product_variant_id,
  quantity_on_hand, quantity_reserved, quantity_available,
  min_stock, max_stock, reorder_point, created_at, updated_at
)
VALUES
(@company_id, @warehouse_a, @variant_id, 30.0000, 0.0000, 30.0000, 0.0000, NULL, NULL, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@company_id, @warehouse_b, @variant_id, 10.0000, 0.0000, 10.0000, 0.0000, NULL, NULL, UTC_TIMESTAMP(), UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE
quantity_on_hand = VALUES(quantity_on_hand),
quantity_reserved = VALUES(quantity_reserved),
quantity_available = VALUES(quantity_available),
updated_at = UTC_TIMESTAMP();

SELECT 'BASELINE' AS step,
       i.company_id, i.warehouse_id, i.product_variant_id,
       i.quantity_on_hand, i.quantity_reserved, i.quantity_available
FROM inventory i
WHERE i.company_id = @company_id
  AND i.product_variant_id = @variant_id
  AND i.warehouse_id IN (@warehouse_a, @warehouse_b)
ORDER BY i.warehouse_id;

-- 2) Adjustment IN + OUT (net +3)
INSERT INTO inventory_movements (
  company_id, movement_type_id, warehouse_id, related_warehouse_id,
  product_variant_id, quantity, unit_cost, movement_date, reason,
  source_document_type, source_document_id, created_at, created_by
)
VALUES
(@company_id, @adjust_in, @warehouse_a, NULL, @variant_id, 5.0000, 0.0000, UTC_TIMESTAMP(), 'SQL_SMOKE_ADJUST_IN', 'SMOKE', NULL, UTC_TIMESTAMP(), @user_id),
(@company_id, @adjust_out, @warehouse_a, NULL, @variant_id, 2.0000, 0.0000, UTC_TIMESTAMP(), 'SQL_SMOKE_ADJUST_OUT', 'SMOKE', NULL, UTC_TIMESTAMP(), @user_id);

SELECT 'AFTER_ADJUST' AS step,
       quantity_on_hand, quantity_reserved, quantity_available
FROM inventory
WHERE company_id = @company_id
  AND warehouse_id = @warehouse_a
  AND product_variant_id = @variant_id;

-- 3) Transfer A -> B (qty 4)
INSERT INTO inventory_movements (
  company_id, movement_type_id, warehouse_id, related_warehouse_id,
  product_variant_id, quantity, unit_cost, movement_date, reason,
  source_document_type, source_document_id, created_at, created_by
)
VALUES
(@company_id, @transfer, @warehouse_a, @warehouse_b, @variant_id, 4.0000, 0.0000, UTC_TIMESTAMP(), 'SQL_SMOKE_TRANSFER', 'SMOKE', NULL, UTC_TIMESTAMP(), @user_id);

SELECT 'AFTER_TRANSFER_A' AS step,
       quantity_on_hand, quantity_reserved, quantity_available
FROM inventory
WHERE company_id = @company_id
  AND warehouse_id = @warehouse_a
  AND product_variant_id = @variant_id;

SELECT 'AFTER_TRANSFER_B' AS step,
       quantity_on_hand, quantity_reserved, quantity_available
FROM inventory
WHERE company_id = @company_id
  AND warehouse_id = @warehouse_b
  AND product_variant_id = @variant_id;

-- 4) Negative stock protection check
-- Expected: this should fail due to chk_inventory_non_negative.
-- If your client stops on error, this line proves rollback behavior by constraint rejection.
INSERT INTO inventory_movements (
  company_id, movement_type_id, warehouse_id, related_warehouse_id,
  product_variant_id, quantity, unit_cost, movement_date, reason,
  source_document_type, source_document_id, created_at, created_by
)
VALUES
(@company_id, @stock_out, @warehouse_a, NULL, @variant_id, 1000.0000, 0.0000, UTC_TIMESTAMP(), 'SQL_SMOKE_NEGATIVE_EXPECT_FAIL', 'SMOKE', NULL, UTC_TIMESTAMP(), @user_id);

-- 5) Audit trace check (only for successful movement inserts)
SELECT 'AUDIT_SAMPLE' AS step,
       table_name, action_type, changed_at
FROM audit_logs
WHERE company_id = @company_id
  AND table_name = 'inventory_movements'
ORDER BY id DESC
LIMIT 10;

-- Keep environment clean.
ROLLBACK;

-- 6) Two-session concurrency playbook (manual)
-- Session A
--   START TRANSACTION;
--   INSERT INTO inventory_movements (...) VALUES (@company_id, @stock_out, @warehouse_a, NULL, @variant_id, 20.0000, ...);
--   DO SLEEP(8);
--   COMMIT;
--
-- Session B (run while A is sleeping)
--   START TRANSACTION;
--   INSERT INTO inventory_movements (...) VALUES (@company_id, @stock_out, @warehouse_a, NULL, @variant_id, 20.0000, ...);
--   COMMIT;
--
-- Expected result:
-- - One session may block waiting for row lock on inventory update.
-- - If combined effect would drive stock negative, one insert should fail by check constraint.
