-- =============================================================================
-- products.reset.sql
-- Limpieza selectiva de datos demo de productos (company_id = 2)
-- Objetivo: resetear datos de prueba sin afectar históricos
-- =============================================================================

SET @company_id = 2;

-- 1) Identificar productos demo insertados por products.seed.sql
CREATE TEMPORARY TABLE tmp_demo_products (
  id BIGINT UNSIGNED PRIMARY KEY
);

INSERT INTO tmp_demo_products (id)
SELECT p.id
FROM products p
WHERE p.company_id = @company_id
  AND p.sku IN (
    'SAMS-GS24-BLK',
    'BOSCH-GSB120-KIT',
    'LEN-TPE14-8256',
    'HP-LJ-M404DN',
    'SONY-WH1000XM5-BLK',
    'CANON-G3170-KIT',
    'MAKITA-DHP453-KIT',
    'PAPEL-A4-80G-RES',
    'GUANTE-NITRILO-M',
    'DEST-PHILIPS-SET6'
  );

-- 2) Identificar variantes demo (por producto demo + códigos demo)
CREATE TEMPORARY TABLE tmp_demo_variants (
  id BIGINT UNSIGNED PRIMARY KEY
);

INSERT INTO tmp_demo_variants (id)
SELECT pv.id
FROM product_variants pv
WHERE pv.company_id = @company_id
  AND (
    pv.product_id IN (SELECT id FROM tmp_demo_products)
    OR pv.variant_code IN (
      'GS24-128-BLK',
      'GS24-128-WHT',
      'GSB120-KIT-STD',
      'TPE14-I5-8-256',
      'TPE14-I5-16-512',
      'LJ-M404DN-STD',
      'WH1000XM5-BLK',
      'WH1000XM5-SLV',
      'G3170-STD',
      'DHP453-3AH-KIT',
      'PAPEL-A4-80G-1R',
      'PAPEL-A4-80G-10R',
      'GUANTE-NIT-CAJ-M',
      'GUANTE-NIT-CAJ-L',
      'DEST-SET6-STD'
    )
  );

-- 3) Eliminar dependencias transaccionales de las variantes demo
DELETE sd
FROM sale_details sd
INNER JOIN tmp_demo_variants dv ON dv.id = sd.product_variant_id
WHERE sd.company_id = @company_id;

DELETE dd
FROM document_details dd
INNER JOIN tmp_demo_variants dv ON dv.id = dd.product_variant_id
WHERE dd.company_id = @company_id;

DELETE im
FROM inventory_movements im
INNER JOIN tmp_demo_variants dv ON dv.id = im.product_variant_id
WHERE im.company_id = @company_id;

DELETE i
FROM inventory i
INNER JOIN tmp_demo_variants dv ON dv.id = i.product_variant_id
WHERE i.company_id = @company_id;

-- 4) Eliminar dependencias de productos demo
DELETE pi
FROM product_images pi
INNER JOIN tmp_demo_products dp ON dp.id = pi.product_id
WHERE pi.company_id = @company_id;

DELETE pv
FROM product_variants pv
INNER JOIN tmp_demo_variants dv ON dv.id = pv.id
WHERE pv.company_id = @company_id;

DELETE p
FROM products p
INNER JOIN tmp_demo_products dp ON dp.id = p.id
WHERE p.company_id = @company_id;

-- 5) Eliminar catálogos demo solo si quedaron sin uso
DELETE m
FROM models m
LEFT JOIN products p ON p.model_id = m.id AND p.company_id = m.company_id
WHERE m.company_id = @company_id
  AND m.code IN (
    'GALAXY-S24', 'LG-GRAM-16', 'XPERIA-5V', 'GSB120', 'DHP453',
    'SCOTCH-600', 'LJ-M404DN', 'PIXMA-G3170', 'THINKPAD-E14', 'MFC-L2750DW'
  )
  AND p.id IS NULL;

DELETE b
FROM brands b
LEFT JOIN models m ON m.brand_id = b.id AND m.company_id = b.company_id
LEFT JOIN products p ON p.brand_id = b.id AND p.company_id = b.company_id
WHERE b.company_id = @company_id
  AND b.code IN ('SAMSUNG', 'LG', 'SONY', 'BOSCH', 'MAKITA', '3M', 'HP', 'CANON', 'LENOVO', 'BROTHER')
  AND m.id IS NULL
  AND p.id IS NULL;

DELETE sc
FROM subcategories sc
LEFT JOIN products p ON p.subcategory_id = sc.id AND p.company_id = sc.company_id
WHERE sc.company_id = @company_id
  AND sc.code IN (
    'ELEC-CEL', 'ELEC-TAB', 'HERR-MAN', 'HERR-ELE', 'INFO-NB',
    'INFO-IMP', 'CONS-PAP', 'FERR-TOR', 'LIMP-DET', 'SEGR-EPP'
  )
  AND p.id IS NULL;

DELETE c
FROM categories c
LEFT JOIN subcategories sc ON sc.category_id = c.id AND sc.company_id = c.company_id
LEFT JOIN products p ON p.category_id = c.id AND p.company_id = c.company_id
WHERE c.company_id = @company_id
  AND c.code IN (
    'CAT-ELEC', 'CAT-HERR', 'CAT-INFO', 'CAT-CONS', 'CAT-ELHO',
    'CAT-FERR', 'CAT-LIMP', 'CAT-SEGR', 'CAT-AUDI', 'CAT-TELE'
  )
  AND sc.id IS NULL
  AND p.id IS NULL;

DELETE s
FROM suppliers s
LEFT JOIN documents d ON d.supplier_id = s.id AND d.company_id = s.company_id
LEFT JOIN supplier_contacts sc ON sc.supplier_id = s.id AND sc.company_id = s.company_id
WHERE s.company_id = @company_id
  AND s.code IN (
    'PRO-1003', 'PRO-1004', 'PRO-1005', 'PRO-1006', 'PRO-1007',
    'PRO-1008', 'PRO-1009', 'PRO-1010', 'PRO-1011', 'PRO-1012'
  )
  AND d.id IS NULL
  AND sc.id IS NULL;

DELETE u
FROM units_of_measure u
LEFT JOIN products p ON p.base_uom_id = u.id AND p.company_id = u.company_id
LEFT JOIN unit_conversions uc_from ON uc_from.from_unit_id = u.id AND uc_from.company_id = u.company_id
LEFT JOIN unit_conversions uc_to ON uc_to.to_unit_id = u.id AND uc_to.company_id = u.company_id
WHERE u.company_id = @company_id
  AND u.code IN ('GRM', 'TON', 'LTR', 'MLT', 'PZA', 'CAJ', 'PAQ', 'DOC', 'M2', 'CM')
  AND p.id IS NULL
  AND uc_from.id IS NULL
  AND uc_to.id IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_demo_variants;
DROP TEMPORARY TABLE IF EXISTS tmp_demo_products;

-- Verificación rápida post-reset
SELECT 'units_of_measure' AS tabla, COUNT(*) AS total FROM units_of_measure WHERE company_id = @company_id
UNION ALL SELECT 'brands',           COUNT(*) FROM brands           WHERE company_id = @company_id
UNION ALL SELECT 'models',           COUNT(*) FROM models           WHERE company_id = @company_id
UNION ALL SELECT 'categories',       COUNT(*) FROM categories       WHERE company_id = @company_id
UNION ALL SELECT 'subcategories',    COUNT(*) FROM subcategories    WHERE company_id = @company_id
UNION ALL SELECT 'suppliers',        COUNT(*) FROM suppliers        WHERE company_id = @company_id
UNION ALL SELECT 'products',         COUNT(*) FROM products         WHERE company_id = @company_id
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants WHERE company_id = @company_id;
