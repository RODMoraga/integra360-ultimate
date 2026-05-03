-- Enforce warehouse resolution for inventory-affecting document automation.
--
-- Prior behavior silently skipped movement generation when both detail.warehouse_id
-- and document.warehouse_id were NULL because trigger filters required
-- COALESCE(detail.warehouse_id, document.warehouse_id) IS NOT NULL.
--
-- New behavior removes those silent filters so inventory_movements insert fails
-- with NOT NULL violation on warehouse_id, preserving transactional integrity
-- and surfacing configuration/data issues immediately.

DROP TRIGGER IF EXISTS `trg_documents_au_generate_movements`;
DROP TRIGGER IF EXISTS `trg_document_details_ai_generate_movements`;
DROP TRIGGER IF EXISTS `trg_document_details_au_generate_movements`;
DROP TRIGGER IF EXISTS `trg_document_details_ad_generate_movements`;

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
  AND `dt`.`affects_inventory` = 1;

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
  AND `dt`.`affects_inventory` = 1;

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
) AS `src`;

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
  AND `dt`.`affects_inventory` = 1;
