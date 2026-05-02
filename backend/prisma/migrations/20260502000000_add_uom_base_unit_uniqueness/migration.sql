-- ============================================================================
-- Migration: Add functional unique index to enforce single active base unit
--            per (company_id, unit_type) in units_of_measure table.
--
-- Behavior of the functional index expression:
--   WHEN is_base_unit = TRUE  AND deleted_at IS NULL  → CONCAT(company_id,'_',unit_type)
--   WHEN is_base_unit = FALSE OR  deleted_at IS NOT NULL → NULL
--
-- MySQL UNIQUE indexes allow multiple NULL values, so:
--   - Non-base records (is_base_unit=FALSE) → no constraint applied
--   - Soft-deleted records (deleted_at IS NOT NULL) → no constraint applied
--   - Active base records (is_base_unit=TRUE, not deleted) → unique per company+type
--
-- Effect: any INSERT or UPDATE that would create a second active base unit
--   for the same company+type is rejected at the DB level with a duplicate key error,
--   regardless of whether the application layer check was bypassed.
--
-- Requires MySQL 8.0.13+.
-- NOTE: This index cannot be represented in the Prisma schema DSL (no functional index
--   support). Do NOT run `prisma migrate dev` after this — use `prisma migrate deploy`.
-- ============================================================================

CREATE UNIQUE INDEX `uk_uom_single_base_per_type`
ON `units_of_measure` ((
  IF(`is_base_unit` = TRUE AND `deleted_at` IS NULL,
     CONCAT(`company_id`, '_', `unit_type`),
     NULL)
));
