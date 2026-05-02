-- =============================================================================
-- products.seed.sql
-- Datos de prueba para productos y todas las tablas relacionadas
-- company_id = 2 (empresa demo)
-- Idempotente: INSERT IGNORE respeta claves únicas, no duplica en re-ejecuciones
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. UNIDADES DE MEDIDA  (units_of_measure)
--    Añade las que faltan; las existentes (id 1-7, 12-14) se omiten con IGNORE
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO units_of_measure (id, company_id, code, name, symbol, unit_type, is_base_unit, created_at, updated_at) VALUES
-- Peso
(15, 2, 'GRM', 'Gramo',          'g',   'Peso',    0, NOW(), NOW()),
(16, 2, 'TON', 'Tonelada',       't',   'Peso',    0, NOW(), NOW()),
-- Volumen
(17, 2, 'LTR', 'Litro',          'L',   'Volumen', 1, NOW(), NOW()),
(18, 2, 'MLT', 'Mililitro',      'mL',  'Volumen', 0, NOW(), NOW()),
-- Conteo / Empaque
(19, 2, 'PZA', 'Pieza',          'pza', 'Conteo',  0, NOW(), NOW()),
(20, 2, 'CAJ', 'Caja',           'caj', 'Conteo',  0, NOW(), NOW()),
(21, 2, 'PAQ', 'Paquete',        'paq', 'Conteo',  0, NOW(), NOW()),
(22, 2, 'DOC', 'Docena',         'doc', 'Conteo',  0, NOW(), NOW()),
-- Área
(23, 2, 'M2',  'Metro cuadrado', 'm²',  'Área',    1, NOW(), NOW()),
-- Longitud adicional
(24, 2, 'CM',  'Centímetro',     'cm',  'Longitud',0, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 2. MARCAS  (brands)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO brands (id, company_id, code, name, created_at, updated_at) VALUES
(10, 2, 'SAMSUNG',   'Samsung Electronics',  NOW(), NOW()),
(11, 2, 'LG',        'LG Electronics',        NOW(), NOW()),
(12, 2, 'SONY',      'Sony Corporation',      NOW(), NOW()),
(13, 2, 'BOSCH',     'Bosch',                 NOW(), NOW()),
(14, 2, 'MAKITA',    'Makita',                NOW(), NOW()),
(15, 2, '3M',        '3M Chile',              NOW(), NOW()),
(16, 2, 'HP',        'HP Inc.',               NOW(), NOW()),
(17, 2, 'CANON',     'Canon',                 NOW(), NOW()),
(18, 2, 'LENOVO',    'Lenovo',                NOW(), NOW()),
(19, 2, 'BROTHER',   'Brother Industries',    NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 3. MODELOS  (models)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO models (id, company_id, brand_id, code, name, created_at, updated_at) VALUES
(10, 2, 10, 'GALAXY-S24',  'Galaxy S24 Series',          NOW(), NOW()),
(11, 2, 11, 'LG-GRAM-16',  'LG Gram 16',                 NOW(), NOW()),
(12, 2, 12, 'XPERIA-5V',   'Xperia 5 V',                 NOW(), NOW()),
(13, 2, 13, 'GSB120',      'GSB 120-LI Professional',    NOW(), NOW()),
(14, 2, 14, 'DHP453',      'DHP453 Combi Drill',         NOW(), NOW()),
(15, 2, 15, 'SCOTCH-600',  'Scotch 600 Magic Tape',      NOW(), NOW()),
(16, 2, 16, 'LJ-M404DN',   'LaserJet Pro M404dn',        NOW(), NOW()),
(17, 2, 17, 'PIXMA-G3170', 'PIXMA G3170 MegaTank',       NOW(), NOW()),
(18, 2, 18, 'THINKPAD-E14','ThinkPad E14 Gen 5',         NOW(), NOW()),
(19, 2, 19, 'MFC-L2750DW', 'MFC-L2750DW Multifunction',  NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 4. CATEGORÍAS  (categories)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO categories (id, company_id, code, name, description, is_active, created_at, updated_at) VALUES
(10, 2, 'CAT-ELEC', 'Electrónica',       'Dispositivos y equipos electrónicos',             1, NOW(), NOW()),
(11, 2, 'CAT-HERR', 'Herramientas',      'Herramientas manuales y eléctricas',              1, NOW(), NOW()),
(12, 2, 'CAT-INFO', 'Informática',       'Equipos y accesorios computacionales',            1, NOW(), NOW()),
(13, 2, 'CAT-CONS', 'Consumibles',       'Papelería y consumibles de oficina',              1, NOW(), NOW()),
(14, 2, 'CAT-ELHO', 'Electrohogar',      'Electrodomésticos del hogar',                     1, NOW(), NOW()),
(15, 2, 'CAT-FERR', 'Ferretería',        'Artículos de ferretería general',                 1, NOW(), NOW()),
(16, 2, 'CAT-LIMP', 'Limpieza',          'Productos de limpieza e higiene industrial',      1, NOW(), NOW()),
(17, 2, 'CAT-SEGR', 'Seguridad',         'Equipos de protección y seguridad industrial',    1, NOW(), NOW()),
(18, 2, 'CAT-AUDI', 'Audio y Video',     'Equipos de audio y video profesional',            1, NOW(), NOW()),
(19, 2, 'CAT-TELE', 'Telefonía',         'Equipos de telefonía y comunicaciones',           1, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 5. SUBCATEGORÍAS  (subcategories)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO subcategories (id, company_id, category_id, code, name, description, is_active, created_at, updated_at) VALUES
(10, 2, 10, 'ELEC-CEL',   'Celulares',                      'Smartphones y teléfonos móviles',           1, NOW(), NOW()),
(11, 2, 10, 'ELEC-TAB',   'Tabletas',                       'Tablets y e-readers',                       1, NOW(), NOW()),
(12, 2, 11, 'HERR-MAN',   'Herramientas Manuales',          'Destornilladores, llaves, martillos',        1, NOW(), NOW()),
(13, 2, 11, 'HERR-ELE',   'Herramientas Eléctricas',        'Taladros, amoladoras, sierras eléctricas',  1, NOW(), NOW()),
(14, 2, 12, 'INFO-NB',    'Notebooks',                      'Computadores portátiles',                   1, NOW(), NOW()),
(15, 2, 12, 'INFO-IMP',   'Impresoras',                     'Impresoras láser e inyección de tinta',     1, NOW(), NOW()),
(16, 2, 13, 'CONS-PAP',   'Papel y Cartón',                 'Resmas, carpetas y cartulinas',             1, NOW(), NOW()),
(17, 2, 15, 'FERR-TOR',   'Tornillería',                    'Tornillos, tuercas, pernos y espigas',      1, NOW(), NOW()),
(18, 2, 16, 'LIMP-DET',   'Detergentes Industriales',       'Limpiadores, desengrasantes y desinfectantes', 1, NOW(), NOW()),
(19, 2, 17, 'SEGR-EPP',   'Equipo Protección Personal',     'Guantes, cascos, lentes y arneses',         1, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 6. PROVEEDORES  (suppliers)
--    Proveedores 1 y 2 ya existen; insertamos del 10 en adelante
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO suppliers (id, company_id, code, tax_id, legal_name, business_activity, email, phone, payment_terms_days, is_active, created_at, updated_at) VALUES
(10, 2, 'PRO-1003', '76.100.200-3', 'Samsung Chile S.A.',              'Distribución de electrónicos',         'ventas@samsung.cl',    '+56 2 2550 7000', 30, 1, NOW(), NOW()),
(11, 2, 'PRO-1004', '76.200.300-4', 'Bosch Chile Ltda.',               'Herramientas y electrodomésticos',     'info@bosch.cl',        '+56 2 2378 1800', 30, 1, NOW(), NOW()),
(12, 2, 'PRO-1005', '76.300.400-5', 'HP Store Chile SpA',              'Computación e impresión',              'ventas@hp.cl',         '+56 2 2400 5000', 60, 1, NOW(), NOW()),
(13, 2, 'PRO-1006', '76.400.500-6', 'Sony Chile S.A.',                 'Electrónica de consumo',               'soporte@sony.cl',      '+56 2 2481 5800', 30, 1, NOW(), NOW()),
(14, 2, 'PRO-1007', '76.500.600-7', 'Makita Chile S.A.',               'Herramientas industriales',            'ventas@makita.cl',     '+56 2 2350 4000', 45, 1, NOW(), NOW()),
(15, 2, 'PRO-1008', '76.600.700-8', '3M Chile S.A.',                   'Abrasivos, adhesivos y químicos',      'pedidos@3m.cl',        '+56 2 2350 7800', 30, 1, NOW(), NOW()),
(16, 2, 'PRO-1009', '76.700.800-9', 'Canon Chile S.A.',                'Equipos de imagen y cámaras',          'ventas@canon.cl',      '+56 2 2428 1100', 60, 1, NOW(), NOW()),
(17, 2, 'PRO-1010', '76.800.900-K', 'Lenovo Chile SpA',                'Computadores y servidores',            'ventas@lenovo.cl',     '+56 2 2396 2400', 60, 1, NOW(), NOW()),
(18, 2, 'PRO-1011', '76.900.100-1', 'Distribuidora OfficeMax Ltda.',   'Consumibles y papelería de oficina',   'atencion@officemax.cl','+56 2 2555 1200', 15, 1, NOW(), NOW()),
(19, 2, 'PRO-1012', '77.100.200-2', 'Seguridad Industrial Andina SpA', 'EPP y seguridad laboral',              'pedidos@andina-epp.cl','+56 2 2760 3300', 30, 1, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 7. PRODUCTOS  (products)
--    base_uom_id=1 (UN - Unidad) para la mayoría
--    IVA Chile: 19% → tax_rate = 0.1900
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO products (id, company_id, sku, barcode, name, description,
  category_id, subcategory_id, brand_id, model_id, base_uom_id,
  tax_rate, cost_price, sale_price, min_price,
  weight, weight_unit,
  track_inventory, min_stock, reorder_point,
  is_service, is_featured, is_active, created_at, updated_at) VALUES

(10, 2, 'SAMS-GS24-BLK', '7801234500010',
  'Smartphone Samsung Galaxy S24 128GB Negro',
  'Smartphone Samsung Galaxy S24 128GB, pantalla AMOLED 6.2", cámara 50MP, Android 14.',
  10, 10, 10, 10, 1,
  0.1900, 450000.0000, 599990.0000, 530000.0000,
  0.1670, 'kg',
  1, 2.0000, 5.0000,
  0, 1, 1, NOW(), NOW()),

(11, 2, 'BOSCH-GSB120-KIT', '7802345600011',
  'Taladro Percutor Bosch GSB 120-LI Kit',
  'Taladro percutor inalámbrico 12V, incluye 2 baterías Li-Ion, maletín y 41 accesorios.',
  11, 13, 13, 13, 1,
  0.1900, 65000.0000, 89990.0000, 78000.0000,
  1.8000, 'kg',
  1, 3.0000, 8.0000,
  0, 0, 1, NOW(), NOW()),

(12, 2, 'LEN-TPE14-8256', '7803456700012',
  'Notebook Lenovo ThinkPad E14 Gen 5 Core i5 8GB 256SSD',
  'Notebook 14" FHD IPS, Intel Core i5-1335U, 8GB DDR5, SSD 256GB, Wi-Fi 6, Windows 11 Pro.',
  12, 14, 18, 18, 1,
  0.1900, 520000.0000, 699990.0000, 620000.0000,
  1.5600, 'kg',
  1, 2.0000, 5.0000,
  0, 1, 1, NOW(), NOW()),

(13, 2, 'HP-LJ-M404DN', '7804567800013',
  'Impresora HP LaserJet Pro M404dn',
  'Impresora láser monocromática, 38 ppm, dúplex automático, Ethernet, bandeja 250 hojas.',
  12, 15, 16, 16, 1,
  0.1900, 155000.0000, 199990.0000, 175000.0000,
  7.4000, 'kg',
  1, 1.0000, 4.0000,
  0, 0, 1, NOW(), NOW()),

(14, 2, 'SONY-WH1000XM5-BLK', '7805678900014',
  'Auriculares Sony WH-1000XM5 Cancelación de Ruido Negro',
  'Auriculares over-ear inalámbricos, cancelación de ruido de industria, 30h batería, LDAC.',
  18, NULL, 12, 12, 1,
  0.1900, 190000.0000, 249990.0000, 220000.0000,
  0.2500, 'kg',
  1, 3.0000, 6.0000,
  0, 1, 1, NOW(), NOW()),

(15, 2, 'CANON-G3170-KIT', '7806789000015',
  'Impresora Multifuncional Canon PIXMA G3170 MegaTank',
  'Impresora MegaTank inyección de tinta a color, 4800dpi, Wi-Fi, copiadora y escáner.',
  12, 15, 17, 17, 1,
  0.1900, 75000.0000, 99990.0000, 87000.0000,
  5.1000, 'kg',
  1, 2.0000, 5.0000,
  0, 0, 1, NOW(), NOW()),

(16, 2, 'MAKITA-DHP453-KIT', '7807890100016',
  'Taladro Percutor Inalámbrico Makita DHP453 Kit 18V',
  'Taladro percutor 18V LXT, torque 91Nm, 2 velocidades, 2 baterías 3Ah, cargador y maletín.',
  11, 13, 14, 14, 1,
  0.1900, 98000.0000, 129990.0000, 115000.0000,
  2.1000, 'kg',
  1, 3.0000, 7.0000,
  0, 0, 1, NOW(), NOW()),

(17, 2, 'PAPEL-A4-80G-RES', '7808901200017',
  'Papel Bond A4 80gr - Resma 500 hojas',
  'Papel multipropósito A4 75-80 g/m², blancura 92%, para impresoras láser e inyección.',
  13, 16, NULL, NULL, 21,  -- base_uom_id=21 (PAQ)
  0.1900, 2800.0000, 3990.0000, 3500.0000,
  2.4000, 'kg',
  1, 10.0000, 25.0000,
  0, 0, 1, NOW(), NOW()),

(18, 2, 'GUANTE-NITRILO-M', '7809012300018',
  'Guantes de Nitrilo Desechables Talla M (Caja x 100)',
  'Guantes nitrilo sin polvo, talla M, 3.5g, resistentes a aceites y químicos. Caja 100un.',
  17, 19, 15, NULL, 20,  -- base_uom_id=20 (CAJ)
  0.1900, 12000.0000, 16990.0000, 14500.0000,
  1.1000, 'kg',
  1, 5.0000, 12.0000,
  0, 0, 1, NOW(), NOW()),

(19, 2, 'DEST-PHILIPS-SET6', '7800123400019',
  'Set Destornilladores Phillips y Plano (6 Piezas)',
  'Set 6 destornilladores mango ergonómico bimateria, puntas endurecidas, tamaños PH0-PH3, PL4-PL6.',
  11, 12, NULL, NULL, 1,  -- base_uom_id=1 (UN)
  0.1900, 8500.0000, 11990.0000, 10000.0000,
  0.4800, 'kg',
  1, 5.0000, 10.0000,
  0, 0, 1, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 8. VARIANTES DE PRODUCTO  (product_variants)
--    Al menos 1 variante por producto; algunos tienen 2 variantes (color/capacidad)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO product_variants (id, company_id, product_id, variant_code, name, attributes_json,
  sku, barcode, cost_price, sale_price, is_active, created_at, updated_at) VALUES

-- Producto 10: Smartphone Galaxy S24 — Negro + Blanco
(10, 2, 10, 'GS24-128-BLK', 'Galaxy S24 128GB Negro',
  '{"color":"Negro","capacidad":"128GB"}',
  'SKU-GS24-128-BLK', '7801234510010', 450000.0000, 599990.0000, 1, NOW(), NOW()),

(11, 2, 10, 'GS24-128-WHT', 'Galaxy S24 128GB Blanco',
  '{"color":"Blanco","capacidad":"128GB"}',
  'SKU-GS24-128-WHT', '7801234510011', 450000.0000, 599990.0000, 1, NOW(), NOW()),

-- Producto 11: Taladro Bosch GSB120 — único
(12, 2, 11, 'GSB120-KIT-STD', 'Taladro Bosch GSB 120-LI Kit Estándar',
  '{"incluye":"2 baterías, maletín, 41 accesorios"}',
  'SKU-GSB120-STD', '7802345610011', 65000.0000, 89990.0000, 1, NOW(), NOW()),

-- Producto 12: Notebook Lenovo ThinkPad E14 — 8GB/256SSD + 16GB/512SSD
(13, 2, 12, 'TPE14-I5-8-256', 'ThinkPad E14 i5 8GB 256GB SSD',
  '{"ram":"8GB DDR5","ssd":"256GB","procesador":"Intel Core i5-1335U"}',
  'SKU-TPE14-8-256', '7803456710012', 520000.0000, 699990.0000, 1, NOW(), NOW()),

(14, 2, 12, 'TPE14-I5-16-512', 'ThinkPad E14 i5 16GB 512GB SSD',
  '{"ram":"16GB DDR5","ssd":"512GB","procesador":"Intel Core i5-1335U"}',
  'SKU-TPE14-16-512', '7803456710013', 640000.0000, 849990.0000, 1, NOW(), NOW()),

-- Producto 13: Impresora HP LaserJet M404dn — único
(15, 2, 13, 'LJ-M404DN-STD', 'HP LaserJet Pro M404dn',
  '{"tipo":"Láser monocromática","ppm":38,"duplex":true}',
  'SKU-LJ-M404DN', '7804567810013', 155000.0000, 199990.0000, 1, NOW(), NOW()),

-- Producto 14: Auriculares Sony WH-1000XM5 — Negro + Plata
(16, 2, 14, 'WH1000XM5-BLK', 'Sony WH-1000XM5 Negro',
  '{"color":"Negro","conectividad":"Bluetooth 5.2, NFC"}',
  'SKU-WH1000XM5-BLK', '7805678910014', 190000.0000, 249990.0000, 1, NOW(), NOW()),

(17, 2, 14, 'WH1000XM5-SLV', 'Sony WH-1000XM5 Plata',
  '{"color":"Plata","conectividad":"Bluetooth 5.2, NFC"}',
  'SKU-WH1000XM5-SLV', '7805678910015', 190000.0000, 249990.0000, 1, NOW(), NOW()),

-- Producto 15: Impresora Canon PIXMA G3170 — único
(18, 2, 15, 'G3170-STD', 'Canon PIXMA G3170 MegaTank',
  '{"tipo":"Inyección color","ppp":4800,"wifi":true}',
  'SKU-G3170-STD', '7806789010015', 75000.0000, 99990.0000, 1, NOW(), NOW()),

-- Producto 16: Taladro Makita DHP453 — único
(19, 2, 16, 'DHP453-3AH-KIT', 'Makita DHP453 18V 3Ah Kit',
  '{"tension":"18V","bateria":"3Ah Li-Ion","torque":"91Nm"}',
  'SKU-DHP453-3AH', '7807890110016', 98000.0000, 129990.0000, 1, NOW(), NOW()),

-- Producto 17: Papel A4 80gr — Resma x500 + Caja x10 Resmas
(20, 2, 17, 'PAPEL-A4-80G-1R', 'Papel A4 80gr Resma 500 hojas',
  '{"gramaje":"80g/m²","hojas":500,"formato":"A4"}',
  'SKU-PAPEL-A4-1R', '7808901210017', 2800.0000, 3990.0000, 1, NOW(), NOW()),

(21, 2, 17, 'PAPEL-A4-80G-10R', 'Papel A4 80gr Caja 10 Resmas (5000 hojas)',
  '{"gramaje":"80g/m²","resmas":10,"hojas_total":5000,"formato":"A4"}',
  'SKU-PAPEL-A4-10R', '7808901210018', 26000.0000, 35990.0000, 1, NOW(), NOW()),

-- Producto 18: Guantes Nitrilo — Talla M + Talla L
(22, 2, 18, 'GUANTE-NIT-CAJ-M', 'Guantes Nitrilo Caja x100 Talla M',
  '{"talla":"M","unidades":100,"material":"Nitrilo"}',
  'SKU-GUANTE-NIT-M', '7809012310018', 12000.0000, 16990.0000, 1, NOW(), NOW()),

(23, 2, 18, 'GUANTE-NIT-CAJ-L', 'Guantes Nitrilo Caja x100 Talla L',
  '{"talla":"L","unidades":100,"material":"Nitrilo"}',
  'SKU-GUANTE-NIT-L', '7809012310019', 12000.0000, 16990.0000, 1, NOW(), NOW()),

-- Producto 19: Set Destornilladores Phillips — único
(24, 2, 19, 'DEST-SET6-STD', 'Set Destornilladores 6 Piezas',
  '{"piezas":6,"tipos":"PH0,PH1,PH2,PH3,PL4,PL6","mango":"bimateria"}',
  'SKU-DEST-SET6', '7800123410019', 8500.0000, 11990.0000, 1, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Verificación rápida post-seed
-- ---------------------------------------------------------------------------
SELECT 'units_of_measure' AS tabla, COUNT(*) AS total FROM units_of_measure WHERE company_id = 2
UNION ALL SELECT 'brands',           COUNT(*) FROM brands           WHERE company_id = 2
UNION ALL SELECT 'models',           COUNT(*) FROM models           WHERE company_id = 2
UNION ALL SELECT 'categories',       COUNT(*) FROM categories       WHERE company_id = 2
UNION ALL SELECT 'subcategories',    COUNT(*) FROM subcategories    WHERE company_id = 2
UNION ALL SELECT 'suppliers',        COUNT(*) FROM suppliers        WHERE company_id = 2
UNION ALL SELECT 'products',         COUNT(*) FROM products         WHERE company_id = 2
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants WHERE company_id = 2;
