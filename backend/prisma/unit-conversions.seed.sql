-- =============================================================================
-- unit-conversions.seed.sql
-- Seed idempotente de conversiones comunes para company_id = 2
-- Incluye pares directos e inversos cuando ambas unidades existen y son del mismo tipo
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Asegura unidades comunes necesarias para demo (si no existen)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO units_of_measure (
  company_id,
  code,
  name,
  symbol,
  unit_type,
  is_base_unit,
  created_at,
  updated_at
)
VALUES
  (2, 'MTR', 'Metro', 'm', 'Longitud', 1, NOW(), NOW()),
  (2, 'CM',  'Centímetro', 'cm', 'Longitud', 0, NOW(), NOW()),
  (2, 'LTR', 'Litro', 'L', 'Volumen', 1, NOW(), NOW()),
  (2, 'MLT', 'Mililitro', 'mL', 'Volumen', 0, NOW(), NOW()),
  (2, 'KG',  'Kilogramo', 'kg', 'Peso', 1, NOW(), NOW()),
  (2, 'GRM', 'Gramo', 'g', 'Peso', 0, NOW(), NOW());

-- -----------------------------------------------------------------------------
-- 2) Inserta conversiones comunes (solo si origen/destino existen y comparten tipo)
-- -----------------------------------------------------------------------------
INSERT INTO unit_conversions (
  company_id,
  from_unit_id,
  to_unit_id,
  factor,
  created_at,
  updated_at
)
SELECT
  2,
  u_from.id,
  u_to.id,
  pairs.factor,
  NOW(),
  NOW()
FROM (
  SELECT 'KG' AS from_code, 'GRM' AS to_code, 1000.00000000 AS factor
  UNION ALL SELECT 'GRM', 'KG', 0.00100000
  UNION ALL SELECT 'LTR', 'MLT', 1000.00000000
  UNION ALL SELECT 'MLT', 'LTR', 0.00100000
  UNION ALL SELECT 'MTR', 'CM', 100.00000000
  UNION ALL SELECT 'CM', 'MTR', 0.01000000
) AS pairs
JOIN units_of_measure AS u_from
  ON u_from.company_id = 2
  AND u_from.code = pairs.from_code
  AND u_from.deleted_at IS NULL
JOIN units_of_measure AS u_to
  ON u_to.company_id = 2
  AND u_to.code = pairs.to_code
  AND u_to.deleted_at IS NULL
WHERE u_from.unit_type = u_to.unit_type
  AND NOT EXISTS (
    SELECT 1
    FROM unit_conversions AS uc
    WHERE uc.company_id = 2
      AND uc.from_unit_id = u_from.id
      AND uc.to_unit_id = u_to.id
  );
