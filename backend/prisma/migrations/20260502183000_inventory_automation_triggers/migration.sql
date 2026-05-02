-- Inventory automation and auditing triggers
-- Scope:
-- 1) Keep inventory.quantity_available synchronized.
-- 2) Apply inventory movements to stock atomically.
-- 3) Auto-generate inventory movements from POS sales and inventory-affecting documents.
-- 4) Persist movement-level audit records in audit_logs.
--
-- Notes:
-- - Designed for MySQL 8+.
-- - Triggers are written as single statements for migration-tool compatibility.

-- -----------------------------------------------------------------------------
-- Seed baseline movement types (idempotent)
-- -----------------------------------------------------------------------------
INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'STOCK_IN', 'Ingreso de inventario', 'IN', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'STOCK_IN');

INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'STOCK_OUT', 'Salida de inventario', 'OUT', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'STOCK_OUT');

INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'POS_SALE', 'Salida por venta POS', 'OUT', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'POS_SALE');

INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'POS_SALE_CANCEL', 'Reversa por anulacion de venta POS', 'IN', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'POS_SALE_CANCEL');

INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'TRANSFER', 'Transferencia entre bodegas', 'TRANSFER', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'TRANSFER');

INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'ADJUST_IN', 'Ajuste positivo', 'IN', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'ADJUST_IN');

INSERT INTO `inventory_movement_types` (`code`, `name`, `direction`, `created_at`)
SELECT 'ADJUST_OUT', 'Ajuste negativo', 'OUT', UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM `inventory_movement_types` WHERE `code` = 'ADJUST_OUT');

-- -----------------------------------------------------------------------------
-- Normalize current inventory data before constraints
-- -----------------------------------------------------------------------------
UPDATE `inventory`
SET `quantity_available` = IFNULL(`quantity_on_hand`, 0.0000) - IFNULL(`quantity_reserved`, 0.0000)
WHERE `quantity_available` IS NULL
   OR `quantity_available` <> (IFNULL(`quantity_on_hand`, 0.0000) - IFNULL(`quantity_reserved`, 0.0000));

-- -----------------------------------------------------------------------------
-- Integrity constraints
-- -----------------------------------------------------------------------------
ALTER TABLE `inventory`
  ADD CONSTRAINT `chk_inventory_non_negative`
  CHECK (
    `quantity_on_hand` >= 0
    AND `quantity_reserved` >= 0
    AND `quantity_available` >= 0
  );

ALTER TABLE `inventory`
  ADD CONSTRAINT `chk_inventory_available_formula`
  CHECK (`quantity_available` = (`quantity_on_hand` - `quantity_reserved`));

ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `chk_inventory_movements_quantity_positive`
  CHECK (`quantity` > 0);

-- -----------------------------------------------------------------------------
-- Recreate triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_inventory_bi_set_available`;
DROP TRIGGER IF EXISTS `trg_inventory_bu_set_available`;
DROP TRIGGER IF EXISTS `trg_inventory_movements_ai_apply_stock`;
DROP TRIGGER IF EXISTS `trg_inventory_movements_ai_audit`;
DROP TRIGGER IF EXISTS `trg_inventory_movements_au_audit`;
DROP TRIGGER IF EXISTS `trg_inventory_movements_ad_audit`;
DROP TRIGGER IF EXISTS `trg_sales_au_generate_movements`;
DROP TRIGGER IF EXISTS `trg_sale_details_ai_generate_movements`;
DROP TRIGGER IF EXISTS `trg_sale_details_au_generate_movements`;
DROP TRIGGER IF EXISTS `trg_sale_details_ad_generate_movements`;
DROP TRIGGER IF EXISTS `trg_documents_au_generate_movements`;
DROP TRIGGER IF EXISTS `trg_document_details_ai_generate_movements`;
DROP TRIGGER IF EXISTS `trg_document_details_au_generate_movements`;
DROP TRIGGER IF EXISTS `trg_document_details_ad_generate_movements`;

-- Keep quantity_available always derived from on_hand - reserved.
CREATE TRIGGER `trg_inventory_bi_set_available`
BEFORE INSERT ON `inventory`
FOR EACH ROW
SET NEW.`quantity_available` = IFNULL(NEW.`quantity_on_hand`, 0.0000) - IFNULL(NEW.`quantity_reserved`, 0.0000);

CREATE TRIGGER `trg_inventory_bu_set_available`
BEFORE UPDATE ON `inventory`
FOR EACH ROW
SET NEW.`quantity_available` = IFNULL(NEW.`quantity_on_hand`, 0.0000) - IFNULL(NEW.`quantity_reserved`, 0.0000);

-- Apply each inventory movement directly to inventory (atomic upsert/update).
CREATE TRIGGER `trg_inventory_movements_ai_apply_stock`
AFTER INSERT ON `inventory_movements`
FOR EACH ROW
INSERT INTO `inventory` (
  `company_id`,
  `warehouse_id`,
  `product_variant_id`,
  `quantity_on_hand`,
  `quantity_reserved`,
  `quantity_available`,
  `min_stock`,
  `max_stock`,
  `reorder_point`,
  `created_at`,
  `updated_at`
)
SELECT
  `src`.`company_id`,
  `src`.`warehouse_id`,
  `src`.`product_variant_id`,
  `src`.`delta_qty`,
  0.0000,
  `src`.`delta_qty`,
  0.0000,
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
FROM (
  SELECT
    NEW.`company_id` AS `company_id`,
    NEW.`warehouse_id` AS `warehouse_id`,
    NEW.`product_variant_id` AS `product_variant_id`,
    CASE `mt`.`direction`
      WHEN 'IN' THEN NEW.`quantity`
      WHEN 'OUT' THEN -NEW.`quantity`
      WHEN 'TRANSFER' THEN -NEW.`quantity`
      ELSE 0.0000
    END AS `delta_qty`
  FROM `inventory_movement_types` `mt`
  WHERE `mt`.`id` = NEW.`movement_type_id`

  UNION ALL

  SELECT
    NEW.`company_id` AS `company_id`,
    NEW.`related_warehouse_id` AS `warehouse_id`,
    NEW.`product_variant_id` AS `product_variant_id`,
    NEW.`quantity` AS `delta_qty`
  FROM `inventory_movement_types` `mt`
  WHERE `mt`.`id` = NEW.`movement_type_id`
    AND `mt`.`direction` = 'TRANSFER'
    AND NEW.`related_warehouse_id` IS NOT NULL
) AS `src`
ON DUPLICATE KEY UPDATE
  `quantity_on_hand` = `quantity_on_hand` + VALUES(`quantity_on_hand`),
  `quantity_available` = (`quantity_on_hand` + VALUES(`quantity_on_hand`)) - `quantity_reserved`,
  `updated_at` = UTC_TIMESTAMP();

-- Auditing on inventory_movements
CREATE TRIGGER `trg_inventory_movements_ai_audit`
AFTER INSERT ON `inventory_movements`
FOR EACH ROW
INSERT INTO `audit_logs` (
  `company_id`, `table_name`, `row_pk`, `action_type`, `changed_by`, `changed_at`, `old_data`, `new_data`, `ip_address`, `user_agent`
)
VALUES (
  NEW.`company_id`,
  'inventory_movements',
  CAST(NEW.`id` AS CHAR(120)),
  'INSERT',
  NEW.`created_by`,
  UTC_TIMESTAMP(),
  NULL,
  JSON_OBJECT(
    'id', NEW.`id`,
    'movement_type_id', NEW.`movement_type_id`,
    'warehouse_id', NEW.`warehouse_id`,
    'related_warehouse_id', NEW.`related_warehouse_id`,
    'product_variant_id', NEW.`product_variant_id`,
    'quantity', NEW.`quantity`,
    'source_document_type', NEW.`source_document_type`,
    'source_document_id', NEW.`source_document_id`
  ),
  NULL,
  NULL
);

CREATE TRIGGER `trg_inventory_movements_au_audit`
AFTER UPDATE ON `inventory_movements`
FOR EACH ROW
INSERT INTO `audit_logs` (
  `company_id`, `table_name`, `row_pk`, `action_type`, `changed_by`, `changed_at`, `old_data`, `new_data`, `ip_address`, `user_agent`
)
VALUES (
  NEW.`company_id`,
  'inventory_movements',
  CAST(NEW.`id` AS CHAR(120)),
  'UPDATE',
  NEW.`created_by`,
  UTC_TIMESTAMP(),
  JSON_OBJECT(
    'movement_type_id', OLD.`movement_type_id`,
    'warehouse_id', OLD.`warehouse_id`,
    'related_warehouse_id', OLD.`related_warehouse_id`,
    'product_variant_id', OLD.`product_variant_id`,
    'quantity', OLD.`quantity`,
    'source_document_type', OLD.`source_document_type`,
    'source_document_id', OLD.`source_document_id`
  ),
  JSON_OBJECT(
    'movement_type_id', NEW.`movement_type_id`,
    'warehouse_id', NEW.`warehouse_id`,
    'related_warehouse_id', NEW.`related_warehouse_id`,
    'product_variant_id', NEW.`product_variant_id`,
    'quantity', NEW.`quantity`,
    'source_document_type', NEW.`source_document_type`,
    'source_document_id', NEW.`source_document_id`
  ),
  NULL,
  NULL
);

CREATE TRIGGER `trg_inventory_movements_ad_audit`
AFTER DELETE ON `inventory_movements`
FOR EACH ROW
INSERT INTO `audit_logs` (
  `company_id`, `table_name`, `row_pk`, `action_type`, `changed_by`, `changed_at`, `old_data`, `new_data`, `ip_address`, `user_agent`
)
VALUES (
  OLD.`company_id`,
  'inventory_movements',
  CAST(OLD.`id` AS CHAR(120)),
  'DELETE',
  OLD.`created_by`,
  UTC_TIMESTAMP(),
  JSON_OBJECT(
    'id', OLD.`id`,
    'movement_type_id', OLD.`movement_type_id`,
    'warehouse_id', OLD.`warehouse_id`,
    'related_warehouse_id', OLD.`related_warehouse_id`,
    'product_variant_id', OLD.`product_variant_id`,
    'quantity', OLD.`quantity`,
    'source_document_type', OLD.`source_document_type`,
    'source_document_id', OLD.`source_document_id`
  ),
  NULL,
  NULL,
  NULL
);

-- -----------------------------------------------------------------------------
-- POS sales automation
-- -----------------------------------------------------------------------------

-- Status transitions on sales generate movements for all detail lines.
CREATE TRIGGER `trg_sales_au_generate_movements`
AFTER UPDATE ON `sales`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  `sd`.`company_id`,
  `mt`.`id`,
  `sd`.`warehouse_id`,
  `sd`.`product_variant_id`,
  `sd`.`quantity`,
  `sd`.`unit_price`,
  COALESCE(NEW.`sold_at`, UTC_TIMESTAMP()),
  CONCAT('AUTO_POS_SALE_STATUS_', OLD.`status`, '_TO_', NEW.`status`),
  'SALE',
  NEW.`id`,
  UTC_TIMESTAMP(),
  NEW.`created_by`
FROM `sale_details` `sd`
JOIN `inventory_movement_types` `mt`
  ON `mt`.`code` = CASE
    WHEN OLD.`status` <> 'CONFIRMED' AND NEW.`status` = 'CONFIRMED' THEN 'POS_SALE'
    WHEN OLD.`status` = 'CONFIRMED' AND NEW.`status` IN ('CANCELLED', 'PENDING') THEN 'POS_SALE_CANCEL'
    ELSE NULL
  END
WHERE `sd`.`sale_id` = NEW.`id`;

-- New sale detail on an already confirmed sale.
CREATE TRIGGER `trg_sale_details_ai_generate_movements`
AFTER INSERT ON `sale_details`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  NEW.`company_id`,
  `mt`.`id`,
  NEW.`warehouse_id`,
  NEW.`product_variant_id`,
  NEW.`quantity`,
  NEW.`unit_price`,
  COALESCE(`s`.`sold_at`, UTC_TIMESTAMP()),
  'AUTO_POS_SALE_DETAIL_INSERT',
  'SALE',
  NEW.`sale_id`,
  UTC_TIMESTAMP(),
  `s`.`created_by`
FROM `sales` `s`
JOIN `inventory_movement_types` `mt` ON `mt`.`code` = 'POS_SALE'
WHERE `s`.`id` = NEW.`sale_id`
  AND `s`.`status` = 'CONFIRMED';

-- Updating detail on confirmed sale: reverse old detail then apply new detail.
CREATE TRIGGER `trg_sale_details_au_generate_movements`
AFTER UPDATE ON `sale_details`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  `src`.`company_id`,
  `src`.`movement_type_id`,
  `src`.`warehouse_id`,
  `src`.`product_variant_id`,
  `src`.`quantity`,
  `src`.`unit_cost`,
  `src`.`movement_date`,
  `src`.`reason`,
  `src`.`source_document_type`,
  `src`.`source_document_id`,
  UTC_TIMESTAMP(),
  `src`.`created_by`
FROM (
  SELECT
    OLD.`company_id` AS `company_id`,
    `mt_cancel`.`id` AS `movement_type_id`,
    OLD.`warehouse_id` AS `warehouse_id`,
    OLD.`product_variant_id` AS `product_variant_id`,
    OLD.`quantity` AS `quantity`,
    OLD.`unit_price` AS `unit_cost`,
    COALESCE(`s`.`sold_at`, UTC_TIMESTAMP()) AS `movement_date`,
    'AUTO_POS_SALE_DETAIL_UPDATE_REVERSE' AS `reason`,
    'SALE' AS `source_document_type`,
    NEW.`sale_id` AS `source_document_id`,
    `s`.`created_by` AS `created_by`
  FROM `sales` `s`
  JOIN `inventory_movement_types` `mt_cancel` ON `mt_cancel`.`code` = 'POS_SALE_CANCEL'
  WHERE `s`.`id` = NEW.`sale_id`
    AND `s`.`status` = 'CONFIRMED'
    AND (
      OLD.`quantity` <> NEW.`quantity`
      OR OLD.`warehouse_id` <> NEW.`warehouse_id`
      OR OLD.`product_variant_id` <> NEW.`product_variant_id`
    )

  UNION ALL

  SELECT
    NEW.`company_id` AS `company_id`,
    `mt_sale`.`id` AS `movement_type_id`,
    NEW.`warehouse_id` AS `warehouse_id`,
    NEW.`product_variant_id` AS `product_variant_id`,
    NEW.`quantity` AS `quantity`,
    NEW.`unit_price` AS `unit_cost`,
    COALESCE(`s`.`sold_at`, UTC_TIMESTAMP()) AS `movement_date`,
    'AUTO_POS_SALE_DETAIL_UPDATE_APPLY' AS `reason`,
    'SALE' AS `source_document_type`,
    NEW.`sale_id` AS `source_document_id`,
    `s`.`created_by` AS `created_by`
  FROM `sales` `s`
  JOIN `inventory_movement_types` `mt_sale` ON `mt_sale`.`code` = 'POS_SALE'
  WHERE `s`.`id` = NEW.`sale_id`
    AND `s`.`status` = 'CONFIRMED'
    AND (
      OLD.`quantity` <> NEW.`quantity`
      OR OLD.`warehouse_id` <> NEW.`warehouse_id`
      OR OLD.`product_variant_id` <> NEW.`product_variant_id`
    )
) AS `src`;

-- Deleting detail on confirmed sale reverses stock.
CREATE TRIGGER `trg_sale_details_ad_generate_movements`
AFTER DELETE ON `sale_details`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  OLD.`company_id`,
  `mt`.`id`,
  OLD.`warehouse_id`,
  OLD.`product_variant_id`,
  OLD.`quantity`,
  OLD.`unit_price`,
  COALESCE(`s`.`sold_at`, UTC_TIMESTAMP()),
  'AUTO_POS_SALE_DETAIL_DELETE',
  'SALE',
  OLD.`sale_id`,
  UTC_TIMESTAMP(),
  `s`.`created_by`
FROM `sales` `s`
JOIN `inventory_movement_types` `mt` ON `mt`.`code` = 'POS_SALE_CANCEL'
WHERE `s`.`id` = OLD.`sale_id`
  AND `s`.`status` = 'CONFIRMED';

-- -----------------------------------------------------------------------------
-- Documents automation (purchases, returns, adjustments)
-- -----------------------------------------------------------------------------

-- Status transitions on documents generate movements for all detail lines when document type affects inventory.
CREATE TRIGGER `trg_documents_au_generate_movements`
AFTER UPDATE ON `documents`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  `dd`.`company_id`,
  `mt`.`id`,
  COALESCE(`dd`.`warehouse_id`, NEW.`warehouse_id`) AS `warehouse_id`,
  `dd`.`product_variant_id`,
  `dd`.`quantity`,
  `dd`.`unit_price`,
  COALESCE(NEW.`confirmed_at`, NEW.`document_date`, UTC_TIMESTAMP()),
  CONCAT('AUTO_DOCUMENT_STATUS_', OLD.`status`, '_TO_', NEW.`status`),
  'DOCUMENT',
  NEW.`id`,
  UTC_TIMESTAMP(),
  NEW.`created_by`
FROM `document_details` `dd`
JOIN `document_types` `dt` ON `dt`.`id` = NEW.`document_type_id`
JOIN `inventory_movement_types` `mt`
  ON `mt`.`code` = CASE
    WHEN OLD.`status` <> 'CONFIRMED' AND NEW.`status` = 'CONFIRMED' THEN
      CASE
        WHEN (
          CASE
            WHEN UPPER(`dt`.`code`) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
              CASE
                WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'OUT'
                WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'IN'
                ELSE 'OUT'
              END
            ELSE
              CASE
                WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'IN'
                WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'OUT'
                ELSE 'IN'
              END
          END
        ) = 'IN' THEN 'STOCK_IN' ELSE 'STOCK_OUT'
      END
    WHEN OLD.`status` = 'CONFIRMED' AND NEW.`status` IN ('CANCELLED', 'DRAFT') THEN
      CASE
        WHEN (
          CASE
            WHEN UPPER(`dt`.`code`) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
              CASE
                WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'OUT'
                WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'IN'
                ELSE 'OUT'
              END
            ELSE
              CASE
                WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'IN'
                WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'OUT'
                ELSE 'IN'
              END
          END
        ) = 'IN' THEN 'STOCK_OUT' ELSE 'STOCK_IN'
      END
    ELSE NULL
  END
WHERE `dd`.`document_id` = NEW.`id`
  AND `dt`.`affects_inventory` = 1
  AND COALESCE(`dd`.`warehouse_id`, NEW.`warehouse_id`) IS NOT NULL;

-- New document detail on an already confirmed inventory-affecting document.
CREATE TRIGGER `trg_document_details_ai_generate_movements`
AFTER INSERT ON `document_details`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  NEW.`company_id`,
  `mt`.`id`,
  COALESCE(NEW.`warehouse_id`, `d`.`warehouse_id`) AS `warehouse_id`,
  NEW.`product_variant_id`,
  NEW.`quantity`,
  NEW.`unit_price`,
  COALESCE(`d`.`confirmed_at`, `d`.`document_date`, UTC_TIMESTAMP()),
  'AUTO_DOCUMENT_DETAIL_INSERT',
  'DOCUMENT',
  NEW.`document_id`,
  UTC_TIMESTAMP(),
  `d`.`created_by`
FROM `documents` `d`
JOIN `document_types` `dt` ON `dt`.`id` = `d`.`document_type_id`
JOIN `inventory_movement_types` `mt`
  ON `mt`.`code` = CASE
    WHEN (
      CASE
        WHEN UPPER(`dt`.`code`) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
          CASE
            WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'OUT'
            WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'IN'
            ELSE 'OUT'
          END
        ELSE
          CASE
            WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'IN'
            WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'OUT'
            ELSE 'IN'
          END
      END
    ) = 'IN' THEN 'STOCK_IN' ELSE 'STOCK_OUT'
  END
WHERE `d`.`id` = NEW.`document_id`
  AND `d`.`status` = 'CONFIRMED'
  AND `dt`.`affects_inventory` = 1
  AND COALESCE(NEW.`warehouse_id`, `d`.`warehouse_id`) IS NOT NULL;

-- Updating detail on confirmed inventory-affecting document: reverse old and apply new.
CREATE TRIGGER `trg_document_details_au_generate_movements`
AFTER UPDATE ON `document_details`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  `src`.`company_id`,
  `src`.`movement_type_id`,
  `src`.`warehouse_id`,
  `src`.`product_variant_id`,
  `src`.`quantity`,
  `src`.`unit_cost`,
  `src`.`movement_date`,
  `src`.`reason`,
  `src`.`source_document_type`,
  `src`.`source_document_id`,
  UTC_TIMESTAMP(),
  `src`.`created_by`
FROM (
  SELECT
    OLD.`company_id` AS `company_id`,
    `mt_reverse`.`id` AS `movement_type_id`,
    COALESCE(OLD.`warehouse_id`, `d`.`warehouse_id`) AS `warehouse_id`,
    OLD.`product_variant_id` AS `product_variant_id`,
    OLD.`quantity` AS `quantity`,
    OLD.`unit_price` AS `unit_cost`,
    COALESCE(`d`.`confirmed_at`, `d`.`document_date`, UTC_TIMESTAMP()) AS `movement_date`,
    'AUTO_DOCUMENT_DETAIL_UPDATE_REVERSE' AS `reason`,
    'DOCUMENT' AS `source_document_type`,
    NEW.`document_id` AS `source_document_id`,
    `d`.`created_by` AS `created_by`
  FROM `documents` `d`
  JOIN `document_types` `dt` ON `dt`.`id` = `d`.`document_type_id`
  JOIN `inventory_movement_types` `mt_reverse`
    ON `mt_reverse`.`code` = CASE
      WHEN (
        CASE
          WHEN UPPER(`dt`.`code`) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
            CASE
              WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'OUT'
              WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'IN'
              ELSE 'OUT'
            END
          ELSE
            CASE
              WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'IN'
              WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'OUT'
              ELSE 'IN'
            END
        END
      ) = 'IN' THEN 'STOCK_OUT' ELSE 'STOCK_IN'
    END
  WHERE `d`.`id` = NEW.`document_id`
    AND `d`.`status` = 'CONFIRMED'
    AND `dt`.`affects_inventory` = 1
    AND (
      OLD.`quantity` <> NEW.`quantity`
      OR OLD.`warehouse_id` <> NEW.`warehouse_id`
      OR OLD.`product_variant_id` <> NEW.`product_variant_id`
    )
    AND COALESCE(OLD.`warehouse_id`, `d`.`warehouse_id`) IS NOT NULL

  UNION ALL

  SELECT
    NEW.`company_id` AS `company_id`,
    `mt_apply`.`id` AS `movement_type_id`,
    COALESCE(NEW.`warehouse_id`, `d`.`warehouse_id`) AS `warehouse_id`,
    NEW.`product_variant_id` AS `product_variant_id`,
    NEW.`quantity` AS `quantity`,
    NEW.`unit_price` AS `unit_cost`,
    COALESCE(`d`.`confirmed_at`, `d`.`document_date`, UTC_TIMESTAMP()) AS `movement_date`,
    'AUTO_DOCUMENT_DETAIL_UPDATE_APPLY' AS `reason`,
    'DOCUMENT' AS `source_document_type`,
    NEW.`document_id` AS `source_document_id`,
    `d`.`created_by` AS `created_by`
  FROM `documents` `d`
  JOIN `document_types` `dt` ON `dt`.`id` = `d`.`document_type_id`
  JOIN `inventory_movement_types` `mt_apply`
    ON `mt_apply`.`code` = CASE
      WHEN (
        CASE
          WHEN UPPER(`dt`.`code`) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
            CASE
              WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'OUT'
              WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'IN'
              ELSE 'OUT'
            END
          ELSE
            CASE
              WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'IN'
              WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'OUT'
              ELSE 'IN'
            END
        END
      ) = 'IN' THEN 'STOCK_IN' ELSE 'STOCK_OUT'
    END
  WHERE `d`.`id` = NEW.`document_id`
    AND `d`.`status` = 'CONFIRMED'
    AND `dt`.`affects_inventory` = 1
    AND (
      OLD.`quantity` <> NEW.`quantity`
      OR OLD.`warehouse_id` <> NEW.`warehouse_id`
      OR OLD.`product_variant_id` <> NEW.`product_variant_id`
    )
    AND COALESCE(NEW.`warehouse_id`, `d`.`warehouse_id`) IS NOT NULL
) AS `src`;

-- Deleting detail on confirmed inventory-affecting document: reverse movement.
CREATE TRIGGER `trg_document_details_ad_generate_movements`
AFTER DELETE ON `document_details`
FOR EACH ROW
INSERT INTO `inventory_movements` (
  `company_id`, `movement_type_id`, `warehouse_id`, `product_variant_id`, `quantity`, `unit_cost`,
  `movement_date`, `reason`, `source_document_type`, `source_document_id`, `created_at`, `created_by`
)
SELECT
  OLD.`company_id`,
  `mt_reverse`.`id`,
  COALESCE(OLD.`warehouse_id`, `d`.`warehouse_id`) AS `warehouse_id`,
  OLD.`product_variant_id`,
  OLD.`quantity`,
  OLD.`unit_price`,
  COALESCE(`d`.`confirmed_at`, `d`.`document_date`, UTC_TIMESTAMP()),
  'AUTO_DOCUMENT_DETAIL_DELETE',
  'DOCUMENT',
  OLD.`document_id`,
  UTC_TIMESTAMP(),
  `d`.`created_by`
FROM `documents` `d`
JOIN `document_types` `dt` ON `dt`.`id` = `d`.`document_type_id`
JOIN `inventory_movement_types` `mt_reverse`
  ON `mt_reverse`.`code` = CASE
    WHEN (
      CASE
        WHEN UPPER(`dt`.`code`) REGEXP 'DEV|RETURN|CREDIT|NC' THEN
          CASE
            WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'OUT'
            WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'IN'
            ELSE 'OUT'
          END
        ELSE
          CASE
            WHEN `dt`.`counterpart_scope` = 'SUPPLIER' THEN 'IN'
            WHEN `dt`.`counterpart_scope` = 'CUSTOMER' THEN 'OUT'
            ELSE 'IN'
          END
      END
    ) = 'IN' THEN 'STOCK_OUT' ELSE 'STOCK_IN'
  END
WHERE `d`.`id` = OLD.`document_id`
  AND `d`.`status` = 'CONFIRMED'
  AND `dt`.`affects_inventory` = 1
  AND COALESCE(OLD.`warehouse_id`, `d`.`warehouse_id`) IS NOT NULL;
