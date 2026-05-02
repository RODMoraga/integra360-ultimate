-- Fix outbound/transfer stock application trigger behavior.
--
-- Root cause:
-- The previous UPSERT inserted negative seed rows for OUT/TRANSFER source paths,
-- which violated chk_inventory_non_negative before ON DUPLICATE KEY UPDATE ran.
--
-- Strategy:
-- 1) Update existing inventory rows using signed deltas (IN/OUT/TRANSFER source+destination).
-- 2) Insert missing rows only for positive deltas (IN and TRANSFER destination).

DROP TRIGGER IF EXISTS `trg_inventory_movements_ai_apply_stock`;
DROP TRIGGER IF EXISTS `trg_inventory_movements_ai_apply_stock_insert_missing`;

CREATE TRIGGER `trg_inventory_movements_ai_apply_stock`
AFTER INSERT ON `inventory_movements`
FOR EACH ROW
UPDATE `inventory` `i`
JOIN (
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
) `src`
  ON `i`.`company_id` = `src`.`company_id`
 AND `i`.`warehouse_id` = `src`.`warehouse_id`
 AND `i`.`product_variant_id` = `src`.`product_variant_id`
SET
  `i`.`quantity_on_hand` = `i`.`quantity_on_hand` + `src`.`delta_qty`,
  `i`.`quantity_available` = (`i`.`quantity_on_hand` + `src`.`delta_qty`) - `i`.`quantity_reserved`,
  `i`.`updated_at` = UTC_TIMESTAMP();

CREATE TRIGGER `trg_inventory_movements_ai_apply_stock_insert_missing`
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
) `src`
WHERE `src`.`delta_qty` > 0
  AND NOT EXISTS (
    SELECT 1
    FROM `inventory` `i`
    WHERE `i`.`company_id` = `src`.`company_id`
      AND `i`.`warehouse_id` = `src`.`warehouse_id`
      AND `i`.`product_variant_id` = `src`.`product_variant_id`
  );
