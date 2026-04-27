-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NULL,
    `table_name` VARCHAR(120) NOT NULL,
    `row_pk` VARCHAR(120) NOT NULL,
    `action_type` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    `changed_by` BIGINT UNSIGNED NULL,
    `changed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,

    INDEX `idx_audit_logs_changed_by`(`changed_by`),
    INDEX `idx_audit_logs_company_date_action`(`company_id`, `changed_at`, `action_type`),
    INDEX `idx_audit_logs_company_table_date`(`company_id`, `table_name`, `changed_at`),
    INDEX `idx_audit_logs_table_pk`(`table_name`, `row_pk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_brands_company_name`(`company_id`, `name`),
    UNIQUE INDEX `uk_brands_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_closings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `cash_opening_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `closed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expected_amount` DECIMAL(18, 4) NOT NULL,
    `counted_amount` DECIMAL(18, 4) NOT NULL,
    `difference_amount` DECIMAL(18, 4) NOT NULL,
    `note` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_cash_closings_opening`(`cash_opening_id`),
    INDEX `fk_cash_closings_user`(`user_id`),
    INDEX `idx_cash_closings_company_opening`(`company_id`, `cash_opening_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_movements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `cash_opening_id` BIGINT UNSIGNED NOT NULL,
    `movement_type` ENUM('IN', 'OUT') NOT NULL,
    `amount` DECIMAL(18, 4) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `reference_type` VARCHAR(40) NULL,
    `reference_id` BIGINT UNSIGNED NULL,
    `moved_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_cash_movements_opening`(`cash_opening_id`),
    INDEX `idx_cash_movements_company_date`(`company_id`, `moved_at`),
    INDEX `idx_cash_movements_company_opening`(`company_id`, `cash_opening_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_openings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `cash_register_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `opened_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `opening_amount` DECIMAL(18, 4) NOT NULL,
    `note` VARCHAR(255) NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_cash_openings_register`(`cash_register_id`),
    INDEX `fk_cash_openings_user`(`user_id`),
    INDEX `idx_cash_openings_company_register_status`(`company_id`, `cash_register_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_registers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `terminal_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_cash_registers_terminal`(`terminal_id`),
    INDEX `idx_cash_registers_company_terminal`(`company_id`, `terminal_id`),
    UNIQUE INDEX `uk_cash_registers_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_categories_company_name`(`company_id`, `name`),
    UNIQUE INDEX `uk_categories_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `region_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_cities_region`(`region_id`),
    UNIQUE INDEX `uk_cities_region_code`(`region_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `city_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `postal_code` VARCHAR(20) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_communes_city`(`city_id`),
    UNIQUE INDEX `uk_communes_city_code`(`city_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `legal_name` VARCHAR(180) NOT NULL,
    `trade_name` VARCHAR(180) NULL,
    `tax_id` VARCHAR(30) NOT NULL,
    `industry_type` VARCHAR(60) NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `address_line` VARCHAR(220) NULL,
    `commune_id` BIGINT UNSIGNED NULL,
    `timezone` VARCHAR(80) NOT NULL DEFAULT 'America/Santiago',
    `currency_code` CHAR(3) NOT NULL DEFAULT 'CLP',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `uk_companies_code`(`code`),
    UNIQUE INDEX `uk_companies_tax_id`(`tax_id`),
    INDEX `fk_companies_commune`(`commune_id`),
    INDEX `idx_companies_active`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_contacts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `full_name` VARCHAR(140) NOT NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `role_name` VARCHAR(80) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_customer_contacts_customer`(`customer_id`),
    INDEX `idx_customer_contacts_company_customer`(`company_id`, `customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `tax_id` VARCHAR(30) NULL,
    `legal_name` VARCHAR(180) NOT NULL,
    `business_activity` VARCHAR(120) NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `address_line` VARCHAR(220) NULL,
    `commune_id` BIGINT UNSIGNED NULL,
    `payment_terms_days` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `credit_limit` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_customers_commune`(`commune_id`),
    INDEX `idx_customers_company_name`(`company_id`, `legal_name`),
    INDEX `idx_customers_company_tax`(`company_id`, `tax_id`),
    UNIQUE INDEX `uk_customers_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digital_assets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `storage_disk` VARCHAR(40) NOT NULL DEFAULT 'local',
    `storage_key` VARCHAR(255) NOT NULL,
    `original_filename` VARCHAR(255) NULL,
    `public_url` VARCHAR(700) NULL,
    `mime_type` VARCHAR(120) NOT NULL,
    `extension` VARCHAR(20) NULL,
    `size_bytes` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `width_px` INTEGER UNSIGNED NULL,
    `height_px` INTEGER UNSIGNED NULL,
    `sha256_hash` CHAR(64) NULL,
    `metadata_json` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `idx_digital_assets_company_active`(`company_id`, `is_active`),
    INDEX `idx_digital_assets_company_mime`(`company_id`, `mime_type`),
    UNIQUE INDEX `uk_digital_assets_company_sha256`(`company_id`, `sha256_hash`),
    UNIQUE INDEX `uk_digital_assets_company_storage_key`(`company_id`, `storage_disk`, `storage_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `document_id` BIGINT UNSIGNED NOT NULL,
    `line_number` INTEGER UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NOT NULL,
    `warehouse_id` BIGINT UNSIGNED NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `unit_price` DECIMAL(18, 4) NOT NULL,
    `discount_amount` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `tax_amount` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `line_total` DECIMAL(18, 4) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_document_details_variant`(`product_variant_id`),
    INDEX `fk_document_details_warehouse`(`warehouse_id`),
    INDEX `idx_document_details_company_variant`(`company_id`, `product_variant_id`),
    UNIQUE INDEX `uk_document_details_line`(`document_id`, `line_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_sequences` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `document_type_id` BIGINT UNSIGNED NOT NULL,
    `year_num` SMALLINT UNSIGNED NOT NULL,
    `next_number` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_document_sequences_type`(`document_type_id`),
    UNIQUE INDEX `uk_document_sequences_scope`(`company_id`, `document_type_id`, `year_num`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_types` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `counterpart_scope` ENUM('CUSTOMER', 'SUPPLIER', 'NONE') NOT NULL DEFAULT 'NONE',
    `affects_inventory` BOOLEAN NOT NULL DEFAULT false,
    `affects_accounting` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_document_types_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `document_type_id` BIGINT UNSIGNED NOT NULL,
    `sequence_number` BIGINT UNSIGNED NOT NULL,
    `document_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `warehouse_id` BIGINT UNSIGNED NULL,
    `customer_id` BIGINT UNSIGNED NULL,
    `supplier_id` BIGINT UNSIGNED NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `subtotal` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `tax_total` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `discount_total` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `total` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `notes` VARCHAR(255) NULL,
    `confirmed_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_documents_customer`(`customer_id`),
    INDEX `fk_documents_supplier`(`supplier_id`),
    INDEX `fk_documents_type`(`document_type_id`),
    INDEX `fk_documents_warehouse`(`warehouse_id`),
    INDEX `idx_documents_company_date`(`company_id`, `document_date`),
    INDEX `idx_documents_company_status`(`company_id`, `status`),
    INDEX `idx_documents_company_type_date_status`(`company_id`, `document_type_id`, `document_date`, `status`),
    UNIQUE INDEX `uk_documents_scope_number`(`company_id`, `document_type_id`, `sequence_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `warehouse_id` BIGINT UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NOT NULL,
    `quantity_on_hand` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `quantity_reserved` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `quantity_available` DECIMAL(18, 4) NULL,
    `min_stock` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `max_stock` DECIMAL(18, 4) NULL,
    `reorder_point` DECIMAL(18, 4) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_inventory_variant`(`product_variant_id`),
    INDEX `fk_inventory_warehouse`(`warehouse_id`),
    INDEX `idx_inventory_company_variant`(`company_id`, `product_variant_id`),
    INDEX `idx_inventory_company_warehouse`(`company_id`, `warehouse_id`),
    UNIQUE INDEX `uk_inventory_scope`(`company_id`, `warehouse_id`, `product_variant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_movement_types` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `direction` ENUM('IN', 'OUT', 'TRANSFER') NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_inventory_movement_types_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_movements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `movement_type_id` BIGINT UNSIGNED NOT NULL,
    `warehouse_id` BIGINT UNSIGNED NOT NULL,
    `related_warehouse_id` BIGINT UNSIGNED NULL,
    `product_variant_id` BIGINT UNSIGNED NOT NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `unit_cost` DECIMAL(18, 4) NULL,
    `movement_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reason` VARCHAR(255) NULL,
    `source_document_type` VARCHAR(40) NULL,
    `source_document_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_inventory_movements_related_warehouse`(`related_warehouse_id`),
    INDEX `fk_inventory_movements_type`(`movement_type_id`),
    INDEX `fk_inventory_movements_variant`(`product_variant_id`),
    INDEX `fk_inventory_movements_warehouse`(`warehouse_id`),
    INDEX `idx_inventory_movements_company_date`(`company_id`, `movement_date`),
    INDEX `idx_inventory_movements_company_type_date`(`company_id`, `movement_type_id`, `movement_date`),
    INDEX `idx_inventory_movements_company_variant`(`company_id`, `product_variant_id`),
    INDEX `idx_inventory_movements_company_warehouse`(`company_id`, `warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `models` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `brand_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_models_brand`(`brand_id`),
    UNIQUE INDEX `uk_models_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `requires_reference` BOOLEAN NOT NULL DEFAULT false,
    `is_cash` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_payment_methods_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `module_name` VARCHAR(80) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_permissions_code`(`code`),
    INDEX `idx_permissions_module`(`module_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_terminals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `warehouse_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `device_name` VARCHAR(120) NULL,
    `serial_number` VARCHAR(120) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_pos_terminals_warehouse`(`warehouse_id`),
    INDEX `idx_pos_terminals_company_warehouse`(`company_id`, `warehouse_id`),
    UNIQUE INDEX `uk_pos_terminals_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `asset_id` BIGINT UNSIGNED NOT NULL,
    `purpose` ENUM('PRIMARY', 'GALLERY', 'THUMBNAIL', 'DETAIL', 'PACKAGING') NOT NULL DEFAULT 'GALLERY',
    `alt_text` VARCHAR(255) NULL,
    `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `primary_product_id` BIGINT UNSIGNED NULL,

    INDEX `fk_product_images_product`(`product_id`),
    INDEX `idx_product_images_asset`(`asset_id`),
    INDEX `idx_product_images_company_listing`(`company_id`, `product_id`, `is_primary`, `sort_order`),
    INDEX `idx_product_images_company_product_active`(`company_id`, `product_id`, `is_active`),
    UNIQUE INDEX `uk_product_images_company_product_asset`(`company_id`, `product_id`, `asset_id`),
    UNIQUE INDEX `uk_product_images_company_product_sort`(`company_id`, `product_id`, `sort_order`),
    UNIQUE INDEX `uk_product_images_one_primary`(`company_id`, `primary_product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_code` VARCHAR(60) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `attributes_json` JSON NULL,
    `sku` VARCHAR(60) NULL,
    `barcode` VARCHAR(80) NULL,
    `cost_price` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `sale_price` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_product_variants_product`(`product_id`),
    UNIQUE INDEX `uk_product_variants_company_barcode`(`company_id`, `barcode`),
    UNIQUE INDEX `uk_product_variants_company_code`(`company_id`, `variant_code`),
    UNIQUE INDEX `uk_product_variants_company_sku`(`company_id`, `sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `sku` VARCHAR(60) NOT NULL,
    `barcode` VARCHAR(80) NULL,
    `name` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `category_id` BIGINT UNSIGNED NULL,
    `subcategory_id` BIGINT UNSIGNED NULL,
    `brand_id` BIGINT UNSIGNED NULL,
    `model_id` BIGINT UNSIGNED NULL,
    `base_uom_id` BIGINT UNSIGNED NOT NULL,
    `tax_rate` DECIMAL(8, 4) NOT NULL DEFAULT 0.0000,
    `cost_price` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `sale_price` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `min_price` DECIMAL(18, 4) NULL,
    `weight` DECIMAL(10, 4) NULL,
    `weight_unit` VARCHAR(10) NULL DEFAULT 'kg',
    `width_cm` DECIMAL(10, 4) NULL,
    `height_cm` DECIMAL(10, 4) NULL,
    `depth_cm` DECIMAL(10, 4) NULL,
    `slug` VARCHAR(220) NULL,
    `meta_title` VARCHAR(160) NULL,
    `meta_description` VARCHAR(320) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `track_inventory` BOOLEAN NOT NULL DEFAULT true,
    `min_stock` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `reorder_point` DECIMAL(18, 4) NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `image_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `is_service` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_products_base_uom`(`base_uom_id`),
    INDEX `fk_products_brand`(`brand_id`),
    INDEX `fk_products_category`(`category_id`),
    INDEX `fk_products_model`(`model_id`),
    INDEX `fk_products_subcategory`(`subcategory_id`),
    INDEX `idx_products_company_name`(`company_id`, `name`),
    INDEX `idx_products_featured`(`company_id`, `is_featured`),
    UNIQUE INDEX `uk_products_company_barcode`(`company_id`, `barcode`),
    UNIQUE INDEX `uk_products_company_sku`(`company_id`, `sku`),
    UNIQUE INDEX `uk_products_company_slug`(`company_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `country_code` CHAR(2) NOT NULL DEFAULT 'CL',
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_regions_country_code`(`country_code`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    `granted_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `granted_by` BIGINT UNSIGNED NULL,

    INDEX `fk_role_permissions_permission`(`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `idx_roles_company`(`company_id`),
    UNIQUE INDEX `uk_roles_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `sale_id` BIGINT UNSIGNED NOT NULL,
    `line_number` INTEGER UNSIGNED NOT NULL,
    `warehouse_id` BIGINT UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NOT NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `unit_price` DECIMAL(18, 4) NOT NULL,
    `discount_amount` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `tax_amount` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `line_total` DECIMAL(18, 4) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_sale_details_variant`(`product_variant_id`),
    INDEX `fk_sale_details_warehouse`(`warehouse_id`),
    INDEX `idx_sale_details_company_variant`(`company_id`, `product_variant_id`),
    UNIQUE INDEX `uk_sale_details_line`(`sale_id`, `line_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `sale_id` BIGINT UNSIGNED NOT NULL,
    `payment_method_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(18, 4) NOT NULL,
    `reference_code` VARCHAR(120) NULL,
    `paid_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_sale_payments_method`(`payment_method_id`),
    INDEX `fk_sale_payments_sale`(`sale_id`),
    INDEX `idx_sale_payments_company_sale`(`company_id`, `sale_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `cash_opening_id` BIGINT UNSIGNED NOT NULL,
    `terminal_id` BIGINT UNSIGNED NOT NULL,
    `customer_id` BIGINT UNSIGNED NULL,
    `document_id` BIGINT UNSIGNED NULL,
    `sold_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `tax_total` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `discount_total` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `total` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_sales_customer`(`customer_id`),
    INDEX `fk_sales_document`(`document_id`),
    INDEX `fk_sales_opening`(`cash_opening_id`),
    INDEX `fk_sales_terminal`(`terminal_id`),
    INDEX `idx_sales_company_date`(`company_id`, `sold_at`),
    INDEX `idx_sales_company_opening_date`(`company_id`, `cash_opening_id`, `sold_at`),
    INDEX `idx_sales_company_status`(`company_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subcategories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_subcategories_category`(`category_id`),
    UNIQUE INDEX `uk_subcategories_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_contacts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `full_name` VARCHAR(140) NOT NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `role_name` VARCHAR(80) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_supplier_contacts_supplier`(`supplier_id`),
    INDEX `idx_supplier_contacts_company_supplier`(`company_id`, `supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `tax_id` VARCHAR(30) NULL,
    `legal_name` VARCHAR(180) NOT NULL,
    `business_activity` VARCHAR(120) NULL,
    `email` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `address_line` VARCHAR(220) NULL,
    `commune_id` BIGINT UNSIGNED NULL,
    `payment_terms_days` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `fk_suppliers_commune`(`commune_id`),
    INDEX `idx_suppliers_company_name`(`company_id`, `legal_name`),
    INDEX `idx_suppliers_company_tax`(`company_id`, `tax_id`),
    UNIQUE INDEX `uk_suppliers_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_conversions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `from_unit_id` BIGINT UNSIGNED NOT NULL,
    `to_unit_id` BIGINT UNSIGNED NOT NULL,
    `factor` DECIMAL(18, 8) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_unit_conversions_from_uom`(`from_unit_id`),
    INDEX `fk_unit_conversions_to_uom`(`to_unit_id`),
    UNIQUE INDEX `uk_unit_conversions_pair`(`company_id`, `from_unit_id`, `to_unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units_of_measure` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `unit_type` VARCHAR(40) NOT NULL,
    `is_base_unit` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_uom_company_type`(`company_id`, `unit_type`),
    UNIQUE INDEX `uk_uom_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `assigned_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `assigned_by` BIGINT UNSIGNED NULL,

    INDEX `fk_user_roles_role`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `terminal_id` BIGINT UNSIGNED NULL,
    `device_fingerprint` VARCHAR(180) NULL,
    `ip_address` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `login_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `logout_at` DATETIME(0) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_user_sessions_user`(`user_id`),
    INDEX `idx_user_sessions_company_user_active`(`company_id`, `user_id`, `is_active`),
    INDEX `idx_user_sessions_login`(`login_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `full_name` VARCHAR(160) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,
    `created_by` BIGINT UNSIGNED NULL,

    INDEX `idx_users_company_active`(`company_id`, `is_active`),
    UNIQUE INDEX `uk_users_company_email`(`company_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(140) NOT NULL,
    `address_line` VARCHAR(220) NULL,
    `commune_id` BIGINT UNSIGNED NULL,
    `is_main` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_warehouses_commune`(`commune_id`),
    INDEX `idx_warehouses_company_active`(`company_id`, `is_active`),
    UNIQUE INDEX `uk_warehouses_company_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `fk_brands_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_closings` ADD CONSTRAINT `fk_cash_closings_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_closings` ADD CONSTRAINT `fk_cash_closings_opening` FOREIGN KEY (`cash_opening_id`) REFERENCES `cash_openings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_closings` ADD CONSTRAINT `fk_cash_closings_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_movements` ADD CONSTRAINT `fk_cash_movements_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_movements` ADD CONSTRAINT `fk_cash_movements_opening` FOREIGN KEY (`cash_opening_id`) REFERENCES `cash_openings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_openings` ADD CONSTRAINT `fk_cash_openings_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_openings` ADD CONSTRAINT `fk_cash_openings_register` FOREIGN KEY (`cash_register_id`) REFERENCES `cash_registers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_openings` ADD CONSTRAINT `fk_cash_openings_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_registers` ADD CONSTRAINT `fk_cash_registers_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_registers` ADD CONSTRAINT `fk_cash_registers_terminal` FOREIGN KEY (`terminal_id`) REFERENCES `pos_terminals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `fk_categories_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `fk_cities_region` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `communes` ADD CONSTRAINT `fk_communes_city` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `fk_companies_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customer_contacts` ADD CONSTRAINT `fk_customer_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customer_contacts` ADD CONSTRAINT `fk_customer_contacts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `digital_assets` ADD CONSTRAINT `fk_digital_assets_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_details` ADD CONSTRAINT `fk_document_details_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_details` ADD CONSTRAINT `fk_document_details_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_details` ADD CONSTRAINT `fk_document_details_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_details` ADD CONSTRAINT `fk_document_details_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_sequences` ADD CONSTRAINT `fk_document_sequences_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `document_sequences` ADD CONSTRAINT `fk_document_sequences_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `fk_documents_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `fk_documents_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `fk_documents_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `fk_documents_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `fk_documents_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `fk_inventory_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `fk_inventory_movements_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `fk_inventory_movements_related_warehouse` FOREIGN KEY (`related_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `fk_inventory_movements_type` FOREIGN KEY (`movement_type_id`) REFERENCES `inventory_movement_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `fk_inventory_movements_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `fk_inventory_movements_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `models` ADD CONSTRAINT `fk_models_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `models` ADD CONSTRAINT `fk_models_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment_methods` ADD CONSTRAINT `fk_payment_methods_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pos_terminals` ADD CONSTRAINT `fk_pos_terminals_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pos_terminals` ADD CONSTRAINT `fk_pos_terminals_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `fk_product_images_asset` FOREIGN KEY (`asset_id`) REFERENCES `digital_assets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `fk_product_images_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `fk_product_variants_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `fk_product_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_base_uom` FOREIGN KEY (`base_uom_id`) REFERENCES `units_of_measure`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_model` FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `fk_roles_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `fk_sale_details_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `fk_sale_details_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `fk_sale_details_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `fk_sale_details_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_payments` ADD CONSTRAINT `fk_sale_payments_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_payments` ADD CONSTRAINT `fk_sale_payments_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sale_payments` ADD CONSTRAINT `fk_sale_payments_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_sales_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_sales_document` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_sales_opening` FOREIGN KEY (`cash_opening_id`) REFERENCES `cash_openings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `fk_sales_terminal` FOREIGN KEY (`terminal_id`) REFERENCES `pos_terminals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subcategories` ADD CONSTRAINT `fk_subcategories_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subcategories` ADD CONSTRAINT `fk_subcategories_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supplier_contacts` ADD CONSTRAINT `fk_supplier_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supplier_contacts` ADD CONSTRAINT `fk_supplier_contacts_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `fk_suppliers_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `fk_suppliers_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `unit_conversions` ADD CONSTRAINT `fk_unit_conversions_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `unit_conversions` ADD CONSTRAINT `fk_unit_conversions_from_uom` FOREIGN KEY (`from_unit_id`) REFERENCES `units_of_measure`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `unit_conversions` ADD CONSTRAINT `fk_unit_conversions_to_uom` FOREIGN KEY (`to_unit_id`) REFERENCES `units_of_measure`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `units_of_measure` ADD CONSTRAINT `fk_uom_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `fk_user_sessions_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `warehouses` ADD CONSTRAINT `fk_warehouses_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `warehouses` ADD CONSTRAINT `fk_warehouses_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
