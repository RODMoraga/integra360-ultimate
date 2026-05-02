-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: localhost    Database: integra360
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('096b4d35-6c9c-4f85-bb0a-81a666e8cb09','2c15356d788f0e48a27b6ac79ad5c67fb75888c9d73ebe55fb8068482e6606b9','2026-04-27 16:47:31.991','0001_baseline',NULL,NULL,'2026-04-27 16:47:31.973',1),('0c2a4b34-5cd3-4e1d-9c0c-3690f50e2fd0','956fe413370e1ab4b92c10c2eff431ebc5f04f0cb1a4701c57a1e390c57be97c','2026-04-27 16:47:52.969','20260427164732_after_baseline',NULL,NULL,'2026-04-27 16:47:32.176',1),('1d3f1e81-10a4-4ba8-aba0-fe6bf6da680b','d5b79e77114b88dab305eb069811d9c59ce5d63b66d9cd6122a11455435a6807','2026-05-01 20:21:22.462','20260501000000_add_soft_delete_document_types',NULL,NULL,'2026-05-01 20:21:22.132',1),('2f541850-e3fe-4665-b973-02fe29161e9f','7541732b52723456ddf4d8780f364a6da3ebd8a60ba1a555c9e2a7114868aea4',NULL,'20260502000000_add_uom_base_unit_uniqueness','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260502000000_add_uom_base_unit_uniqueness\n\nDatabase error code: 1061\n\nDatabase error:\nDuplicate key name \'uk_uom_single_base_per_type\'\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260502000000_add_uom_base_unit_uniqueness\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260502000000_add_uom_base_unit_uniqueness\"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226','2026-05-02 18:29:33.245','2026-05-02 18:16:11.234',0),('85754580-4453-404c-9262-d853f6bdd72c','e6531814e6ffeb547acb7bcd587c7466a143352bb6cb920f0c726fa7315e716c','2026-05-02 18:37:00.490','20260502200000_fix_inventory_movement_outbound_trigger',NULL,NULL,'2026-05-02 18:37:00.367',1),('a6f700ab-9bb8-485b-b0ac-8f6ccf06977a','7541732b52723456ddf4d8780f364a6da3ebd8a60ba1a555c9e2a7114868aea4','2026-05-02 18:29:33.254','20260502000000_add_uom_base_unit_uniqueness','',NULL,'2026-05-02 18:29:33.254',0),('c0d643b8-4cc0-40b5-af03-3a8f664ffa2a','98c5d8385f11135619f53a959f586e5fb60182dda70f7791d4113060de09d086','2026-05-02 18:29:37.606','20260502183000_inventory_automation_triggers',NULL,NULL,'2026-05-02 18:29:36.265',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned DEFAULT NULL,
  `table_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `row_pk` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` enum('INSERT','UPDATE','DELETE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` bigint unsigned DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_changed_by` (`changed_by`),
  KEY `idx_audit_logs_company_date_action` (`company_id`,`changed_at`,`action_type`),
  KEY `idx_audit_logs_company_table_date` (`company_id`,`table_name`,`changed_at`),
  KEY `idx_audit_logs_table_pk` (`table_name`,`row_pk`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_brands_company_code` (`company_id`,`code`),
  KEY `idx_brands_company_name` (`company_id`,`name`),
  CONSTRAINT `fk_brands_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_closings`
--

DROP TABLE IF EXISTS `cash_closings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_closings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `cash_opening_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `closed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_amount` decimal(18,4) NOT NULL,
  `counted_amount` decimal(18,4) NOT NULL,
  `difference_amount` decimal(18,4) NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cash_closings_opening` (`cash_opening_id`),
  KEY `fk_cash_closings_user` (`user_id`),
  KEY `idx_cash_closings_company_opening` (`company_id`,`cash_opening_id`),
  CONSTRAINT `fk_cash_closings_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_cash_closings_opening` FOREIGN KEY (`cash_opening_id`) REFERENCES `cash_openings` (`id`),
  CONSTRAINT `fk_cash_closings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_closings`
--

LOCK TABLES `cash_closings` WRITE;
/*!40000 ALTER TABLE `cash_closings` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash_closings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_movements`
--

DROP TABLE IF EXISTS `cash_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `cash_opening_id` bigint unsigned NOT NULL,
  `movement_type` enum('IN','OUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,4) NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `moved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cash_movements_opening` (`cash_opening_id`),
  KEY `idx_cash_movements_company_date` (`company_id`,`moved_at`),
  KEY `idx_cash_movements_company_opening` (`company_id`,`cash_opening_id`),
  CONSTRAINT `fk_cash_movements_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_cash_movements_opening` FOREIGN KEY (`cash_opening_id`) REFERENCES `cash_openings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_movements`
--

LOCK TABLES `cash_movements` WRITE;
/*!40000 ALTER TABLE `cash_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_openings`
--

DROP TABLE IF EXISTS `cash_openings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_openings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `cash_register_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `opened_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `opening_amount` decimal(18,4) NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('OPEN','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cash_openings_register` (`cash_register_id`),
  KEY `fk_cash_openings_user` (`user_id`),
  KEY `idx_cash_openings_company_register_status` (`company_id`,`cash_register_id`,`status`),
  CONSTRAINT `fk_cash_openings_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_cash_openings_register` FOREIGN KEY (`cash_register_id`) REFERENCES `cash_registers` (`id`),
  CONSTRAINT `fk_cash_openings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_openings`
--

LOCK TABLES `cash_openings` WRITE;
/*!40000 ALTER TABLE `cash_openings` DISABLE KEYS */;
INSERT INTO `cash_openings` VALUES (1,2,3,2,'2026-05-01 23:29:29',10000.0000,'Apertura seed para bloqueo de eliminacion de caja','OPEN','2026-05-01 23:29:29','2026-05-01 23:29:29');
/*!40000 ALTER TABLE `cash_openings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_registers`
--

DROP TABLE IF EXISTS `cash_registers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_registers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `terminal_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cash_registers_company_code` (`company_id`,`code`),
  KEY `fk_cash_registers_terminal` (`terminal_id`),
  KEY `idx_cash_registers_company_terminal` (`company_id`,`terminal_id`),
  CONSTRAINT `fk_cash_registers_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_cash_registers_terminal` FOREIGN KEY (`terminal_id`) REFERENCES `pos_terminals` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_registers`
--

LOCK TABLES `cash_registers` WRITE;
/*!40000 ALTER TABLE `cash_registers` DISABLE KEYS */;
INSERT INTO `cash_registers` VALUES (1,2,2,'DEMO-POS-CR-LOCK','Caja Demo Bloqueo POS',1,'2026-05-01 23:20:03','2026-05-01 23:20:03',NULL),(2,2,4,'DEMO-CASH-REG-FREE','Caja Demo Libre',1,'2026-05-01 23:29:29','2026-05-01 23:29:29',NULL),(3,2,4,'DEMO-CASH-REG-LOCK','Caja Demo Bloqueada',1,'2026-05-01 23:29:29','2026-05-01 23:29:29',NULL),(4,2,4,'SMOKE-CASH-1777678274500','Caja Smoke Test Updated',0,'2026-05-01 23:31:15','2026-05-01 23:31:15','2026-05-01 23:31:15'),(5,2,4,'SMOKE-CASH-1777688280357','Caja Smoke Test Updated',0,'2026-05-02 02:18:00','2026-05-02 02:18:00','2026-05-02 02:18:00');
/*!40000 ALTER TABLE `cash_registers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_company_code` (`company_id`,`code`),
  KEY `idx_categories_company_name` (`company_id`,`name`),
  CONSTRAINT `fk_categories_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `region_id` bigint unsigned NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cities_region_code` (`region_id`,`code`),
  KEY `idx_cities_region` (`region_id`),
  CONSTRAINT `fk_cities_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,1,'IQQ','Iquique','2026-04-30 17:18:58','2026-04-30 17:18:58'),(2,1,'TAM','Tamarugal','2026-04-30 17:20:59','2026-04-30 17:20:59'),(3,2,'ANT','Antofagasta','2026-04-30 17:21:27','2026-04-30 17:21:27'),(4,2,'TOC','Tocopilla','2026-04-30 17:21:52','2026-04-30 17:21:52'),(5,2,'ELL','El Loa','2026-04-30 17:22:21','2026-04-30 17:22:21'),(6,3,'COP','Copiapó','2026-04-30 17:22:41','2026-04-30 17:22:41'),(7,3,'HUA','Huasco','2026-04-30 17:23:06','2026-04-30 17:23:06'),(8,3,'CHA','Chañaral','2026-04-30 17:23:24','2026-04-30 17:23:24'),(9,4,'CHP','Choapa','2026-04-30 17:23:50','2026-04-30 17:23:50'),(10,4,'ELQ','Elqui','2026-04-30 17:24:10','2026-04-30 17:24:10'),(11,4,'LIM','Limarí','2026-04-30 17:24:32','2026-04-30 17:24:32'),(12,5,'IDP','Isla de Pascua','2026-04-30 17:25:00','2026-04-30 17:25:00'),(13,5,'LAN','Los Andes','2026-04-30 17:25:25','2026-04-30 17:25:25'),(14,5,'QUI','Quillota','2026-04-30 17:25:45','2026-04-30 17:25:45'),(15,5,'VAL','Valparaíso','2026-04-30 17:26:06','2026-04-30 17:26:06'),(16,5,'PET','Petorca','2026-04-30 17:26:25','2026-04-30 17:26:25'),(17,5,'SAN','San Antonio','2026-04-30 17:26:50','2026-04-30 17:26:50'),(18,5,'SAF','San Felipe de Aconcagua','2026-04-30 17:27:16','2026-04-30 17:27:16'),(19,5,'MAR','Marga Marga','2026-04-30 17:27:42','2026-04-30 17:27:42');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communes`
--

DROP TABLE IF EXISTS `communes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `city_id` bigint unsigned NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_communes_city_code` (`city_id`,`code`),
  KEY `idx_communes_city` (`city_id`),
  CONSTRAINT `fk_communes_city` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communes`
--

LOCK TABLES `communes` WRITE;
/*!40000 ALTER TABLE `communes` DISABLE KEYS */;
INSERT INTO `communes` VALUES (1,1,'IQQ','Iquique','8000000','2026-04-30 17:29:10','2026-04-30 17:29:10'),(2,1,'ALH','Alto Hospicio','7500000','2026-04-30 17:29:56','2026-04-30 17:29:56'),(3,2,'POA','Pozo Almonte','7500000','2026-04-30 17:30:40','2026-04-30 17:30:40'),(4,2,'CMN','Camiña','7500000','2026-04-30 17:38:13','2026-04-30 17:38:13'),(5,2,'COL','Colchane','7500000','2026-04-30 17:39:04','2026-04-30 17:39:04'),(6,2,'HUA','Huara','7500000','2026-04-30 17:39:38','2026-04-30 17:39:38'),(7,2,'PIC','Pica','7500000','2026-04-30 17:40:08','2026-04-30 17:40:08'),(8,3,'ANT','Antofagasta','7500000','2026-04-30 17:40:56','2026-04-30 17:40:56'),(9,3,'MEJ','Mejillones','7500000','2026-04-30 17:41:25','2026-04-30 17:41:25'),(10,3,'SIE','Sierra Gorda','7500000','2026-04-30 17:41:54','2026-04-30 17:41:54'),(11,3,'TAL','Taltal','7500000','2026-04-30 17:42:21','2026-04-30 17:42:21'),(12,4,'TOC','Tocopilla','7500000','2026-04-30 17:43:00','2026-04-30 17:43:00'),(13,4,'MAE','María Elena','7500000','2026-04-30 17:43:30','2026-04-30 17:43:30'),(14,5,'ELL','Provincia de El Loa','7500000','2026-04-30 17:44:05','2026-04-30 17:44:05'),(15,5,'CLM','Calama','7500000','2026-04-30 17:44:38','2026-04-30 17:44:38'),(16,5,'OLL','Ollague','7500000','2026-04-30 17:45:07','2026-04-30 17:45:07'),(17,5,'SPA','San Pedro de Atacama','7500000','2026-04-30 17:45:37','2026-04-30 17:45:37'),(18,6,'CPP','Copiapó','7500000','2026-04-30 17:46:08','2026-04-30 17:46:08'),(19,6,'CLD','Caldera','7500000','2026-04-30 17:46:41','2026-04-30 17:46:41'),(20,6,'TIE','Tierra Amarilla','7500000','2026-04-30 17:47:07','2026-04-30 17:47:07'),(21,7,'VLL','Vallenar','7500000','2026-04-30 17:48:00','2026-04-30 17:48:00'),(22,7,'ADC','Alto del Carmen','7500000','2026-04-30 17:48:47','2026-04-30 17:48:47'),(23,7,'FRE','Freirina','7500000','2026-04-30 17:49:10','2026-04-30 17:49:10'),(24,7,'HUA','Huasco','7500000','2026-04-30 17:49:33','2026-04-30 17:49:33'),(25,8,'CHN','Chañaral','7500000','2026-04-30 17:50:01','2026-04-30 17:50:01'),(26,8,'DDA','Diego de Almagro','7500000','2026-04-30 17:50:28','2026-04-30 17:50:28'),(27,9,'ILL','Illapel','7500000','2026-04-30 17:51:05','2026-04-30 17:51:05'),(28,9,'CAN','Canela','7500000','2026-04-30 17:51:29','2026-04-30 17:51:29'),(29,9,'LVL','Los Vilos','7500000','2026-04-30 17:52:03','2026-04-30 17:52:03'),(30,9,'SLM','Salamanca','7500000','2026-04-30 17:52:30','2026-04-30 17:52:30'),(31,10,'LAS','La Serena','7500000','2026-04-30 17:53:01','2026-04-30 17:53:01'),(32,10,'CQB','Coquimbo','7500000','2026-04-30 17:53:29','2026-04-30 17:53:29'),(33,10,'ADC','Andacollo','7500000','2026-04-30 17:53:50','2026-04-30 17:53:50'),(34,10,'LAH','La Higuera','7500000','2026-04-30 17:54:17','2026-04-30 17:54:17'),(35,10,'PAI','Paihuano','7500000','2026-04-30 17:54:41','2026-04-30 17:54:41'),(36,10,'VIC','Vicuña','7500000','2026-04-30 17:55:13','2026-04-30 17:55:13'),(37,11,'OVL','Ovalle','7500000','2026-04-30 20:00:26','2026-04-30 20:00:26'),(38,10,'CBB','Combarbalá','7500000','2026-04-30 20:01:00','2026-04-30 20:01:00'),(39,11,'MPA','Monte Patria','7500000','2026-04-30 20:01:38','2026-04-30 20:01:38'),(40,11,'PUN','Punitaqui','7500000','2026-04-30 20:02:04','2026-04-30 20:02:04'),(41,11,'RHT','Río Hurtado','7500000','2026-04-30 20:02:35','2026-04-30 20:02:35'),(42,12,'ISL','Isla de Pascua','7500000','2026-04-30 20:03:10','2026-04-30 20:03:10'),(43,13,'LAN','Los Andes','7500000','2026-04-30 20:04:36','2026-04-30 20:04:36'),(44,13,'CAL','Calle Larga','7500000','2026-04-30 20:05:09','2026-04-30 20:05:09'),(45,13,'RIN','Rinconada','7500000','2026-04-30 20:05:39','2026-04-30 20:05:39'),(46,13,'SES','San Esteban','7500000','2026-04-30 20:06:11','2026-04-30 20:06:11'),(47,14,'QUI','Quillota','7500000','2026-04-30 20:07:05','2026-04-30 20:07:05'),(48,14,'LCA','La Calera','7500000','2026-04-30 20:07:37','2026-04-30 20:07:37'),(49,14,'HIJ','Hijuelas','7500000','2026-04-30 20:08:08','2026-04-30 20:08:08'),(50,14,'LCR','La Cruz','7500000','2026-04-30 20:08:35','2026-04-30 20:08:35'),(51,14,'NGL','Nogales','7500000','2026-04-30 20:09:02','2026-04-30 20:09:02'),(52,15,'VLP','Valparaíso','7500000','2026-04-30 20:09:47','2026-04-30 20:09:47'),(53,15,'CAS','Casablanca','7500000','2026-04-30 20:10:15','2026-04-30 20:10:15'),(54,15,'CCN','Concón','7500000','2026-04-30 20:10:43','2026-04-30 20:10:43'),(55,15,'JFR','Juan Fernández','7500000','2026-04-30 20:12:00','2026-04-30 20:12:00'),(56,15,'PCH','Puchuncaví','7500000','2026-04-30 20:12:35','2026-04-30 20:12:35'),(57,15,'QNT','Quintero','7500000','2026-04-30 20:13:00','2026-04-30 20:13:00'),(58,15,'VDM','Viña del Mar','7500000','2026-04-30 20:13:38','2026-04-30 20:13:38');
/*!40000 ALTER TABLE `communes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trade_name` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry_type` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commune_id` bigint unsigned DEFAULT NULL,
  `timezone` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'America/Santiago',
  `currency_code` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CLP',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_companies_code` (`code`),
  UNIQUE KEY `uk_companies_tax_id` (`tax_id`),
  KEY `fk_companies_commune` (`commune_id`),
  KEY `idx_companies_active` (`is_active`),
  CONSTRAINT `fk_companies_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (2,'EM-100101','Integra360 SpA','Integra360','81.201.000-K',NULL,'superadmin@integra360.cl','+56 9 4637 8473','Av. Providencia # 4585',NULL,'America/Santiago','CLP',1,'2026-04-27 16:17:54','2026-04-27 16:17:54',NULL,NULL),(3,'EM-100102','Comercial Andes SpA','Andes Market','76.543.210-5','Manufacturera','contacto@andesmarket.cl','+56 9 8765 4321','Av. Providencia 1234, Santiago',NULL,'America/Santiago','CLP',1,'2026-04-28 03:00:12','2026-04-28 03:00:12',NULL,2),(4,'EM-100103','Servicios del Pacífico Ltda.','Pacífico Servicios','77.123.456-2','Servicios','info@pacificoservicios.cl','+56 9 8722 2333','Av. Los Leones # 876, Santiago',NULL,'America/Santiago','CLP',1,'2026-04-28 03:02:14','2026-04-28 03:02:14',NULL,2),(5,'EM-100104','Tecnologías del Sur S.A.','TecnoSur','78.987.654-1','Servicios','contacto@tecnosur.cl','+56 9 8744 4555','Av. Alemania # 234, Temuco',NULL,'America/Santiago','CLP',1,'2026-04-28 04:33:55','2026-04-28 04:33:55',NULL,2),(6,'EM-100105','Constructora Altavista Ltda','Altavista','79.111.222-3','Retail','ventas@altavista.cl','+56 9 8766 6777','Av. El Bosque # 456, Santiago',NULL,'America/Santiago','CLP',1,'2026-04-28 04:40:30','2026-04-28 04:40:30',NULL,2),(7,'EM-100107','Distribuidora Norte SpA','NorteMax','80.222.333-4','Manufacturera','contacto@nortemax.cl','+56 9 8788 8999','Av. Independencia # 789, Santiago',NULL,'America/Santiago','CLP',1,'2026-04-28 04:46:07','2026-04-28 04:46:07',NULL,2),(8,'EM-100108','AgroCampos S.A.','AgroCampos','81.333.444-5','Retail','info@agrocampos.cl','+56 9 8611 1222','Ruta 5 Sur Km 12, Talca',NULL,'America/Santiago','CLP',1,'2026-04-28 05:02:26','2026-04-28 05:02:26',NULL,2),(9,'EM-100109','Logística Express Ltda','LogiExpress','82.444.555-6','Manufacturera','contacto@logiexpress.cl','+56 9 6333 7444','Av. Colón # 345, Valparaiso',NULL,'America/Santiago','CLP',1,'2026-04-28 05:06:01','2026-04-28 05:06:01',NULL,2),(10,'EM-100110','Farmacias del Centro SpA','FarmaCentro','83.555.666-7','Servicios','ventas@farmacentro.cl','+56 9 8655 5666','Av. Matta # 678, Santiago',NULL,'America/Santiago','CLP',1,'2026-04-28 05:12:19','2026-04-28 05:12:19',NULL,2),(11,'EM-100111','Panadería La Espiga Ltda','La Espiga','84.666.777-8','Retail','contacto@laespiga.cl','+56 9 8677 7888','Av. O\'Higgins # 234, Santiago',NULL,'America/Santiago','CLP',1,'2026-04-28 05:32:25','2026-04-28 05:32:25',NULL,2);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_contacts`
--

DROP TABLE IF EXISTS `customer_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `full_name` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_customer_contacts_customer` (`customer_id`),
  KEY `idx_customer_contacts_company_customer` (`company_id`,`customer_id`),
  CONSTRAINT `fk_customer_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_customer_contacts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_contacts`
--

LOCK TABLES `customer_contacts` WRITE;
/*!40000 ALTER TABLE `customer_contacts` DISABLE KEYS */;
INSERT INTO `customer_contacts` VALUES (1,2,1,'Rodrigo Moraga Garrido','contacto@empresas.cl','+56 9 7567 4874','Gerente Compras',0,'2026-05-02 04:07:55','2026-05-02 04:07:55',NULL);
/*!40000 ALTER TABLE `customer_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legal_name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_activity` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commune_id` bigint unsigned DEFAULT NULL,
  `payment_terms_days` smallint unsigned NOT NULL DEFAULT '0',
  `credit_limit` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customers_company_code` (`company_id`,`code`),
  KEY `fk_customers_commune` (`commune_id`),
  KEY `idx_customers_company_name` (`company_id`,`legal_name`),
  KEY `idx_customers_company_tax` (`company_id`,`tax_id`),
  CONSTRAINT `fk_customers_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`),
  CONSTRAINT `fk_customers_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,2,'CLI-1001','99.333.444-2','Centro Deportivo Olimpo SpA','Industria','contacto@olimpo.cl','+59 9 8377 7888','Av. Macul # 567',58,7,200000.0000,1,'2026-04-30 21:47:07','2026-04-30 21:47:07',NULL,2),(2,2,'CLI-1002','100.444.555-3','Librería Mundo Libro Ltda.','Mundo Libro','info@mundolibro.cl','+59 9 8399 9000','Av. Portugal # 789',58,7,500000.0000,1,'2026-04-30 21:49:39','2026-04-30 21:49:39',NULL,2),(3,2,'CLI-1003','98.222.333-1','Pastelería Dulce Arte Ltda.','Dulce Arte','info@dulcearte.cl','+59 9 8355 5666','Av. Irarrázaval # 234',39,7,500000.0000,1,'2026-04-30 21:52:19','2026-04-30 21:52:19',NULL,2),(4,2,'CLI-1004','97.111.222-0','Joyería Brillante SpA.','Brillante','contacto@brillante.cl','+56 9 8333 3444','Av. Condell # 678',2,10,500000.0000,1,'2026-04-30 21:54:46','2026-04-30 21:54:46',NULL,2),(5,2,'CLI-1005','76.000.001-5','Cliente Demo Documentos SPA','Comercio General','cliente.demo.docs@integra360.local','+56990001111','Av. Demo 123',NULL,30,1000000.0000,1,'2026-05-01 22:33:18','2026-05-02 17:02:08',NULL,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `digital_assets`
--

DROP TABLE IF EXISTS `digital_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `digital_assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `storage_disk` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local',
  `storage_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_url` varchar(700) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extension` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_bytes` bigint unsigned NOT NULL DEFAULT '0',
  `width_px` int unsigned DEFAULT NULL,
  `height_px` int unsigned DEFAULT NULL,
  `sha256_hash` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_digital_assets_company_storage_key` (`company_id`,`storage_disk`,`storage_key`),
  UNIQUE KEY `uk_digital_assets_company_sha256` (`company_id`,`sha256_hash`),
  KEY `idx_digital_assets_company_active` (`company_id`,`is_active`),
  KEY `idx_digital_assets_company_mime` (`company_id`,`mime_type`),
  CONSTRAINT `fk_digital_assets_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `digital_assets`
--

LOCK TABLES `digital_assets` WRITE;
/*!40000 ALTER TABLE `digital_assets` DISABLE KEYS */;
INSERT INTO `digital_assets` VALUES (1,2,'local','uploads/demo/catalog/product-hero-01.jpg','product-hero-01.jpg','https://cdn.local/demo/product-hero-01.jpg','image/jpeg','jpg',245678,1920,1080,'b8f96f7575f7211cac303f3117a199bd2ff8f3a5cda3649c9f4286f4f3f14f53','{\"alt\": \"Producto Hero 01\", \"source\": \"seed\", \"category\": \"catalog\"}',1,'2026-05-01 20:44:59','2026-05-01 20:44:59',NULL,2),(2,2,'local','uploads/demo/catalog/product-thumb-01.png','product-thumb-01.png','https://cdn.local/demo/product-thumb-01.png','image/png','png',84521,600,600,'1a8c6a5964a6a89f8f829748f4b59deebf95bc2c8df2f91fbb80f42e8e6df759','{\"alt\": \"Miniatura Producto 01\", \"source\": \"seed\", \"category\": \"thumbnail\"}',1,'2026-05-01 20:44:59','2026-05-01 20:44:59',NULL,2);
/*!40000 ALTER TABLE `digital_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_details`
--

DROP TABLE IF EXISTS `document_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `document_id` bigint unsigned NOT NULL,
  `line_number` int unsigned NOT NULL,
  `product_variant_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `quantity` decimal(18,4) NOT NULL,
  `unit_price` decimal(18,4) NOT NULL,
  `discount_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `line_total` decimal(18,4) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_document_details_line` (`document_id`,`line_number`),
  KEY `fk_document_details_variant` (`product_variant_id`),
  KEY `fk_document_details_warehouse` (`warehouse_id`),
  KEY `idx_document_details_company_variant` (`company_id`,`product_variant_id`),
  CONSTRAINT `fk_document_details_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_document_details_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_document_details_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `fk_document_details_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_details`
--

LOCK TABLES `document_details` WRITE;
/*!40000 ALTER TABLE `document_details` DISABLE KEYS */;
INSERT INTO `document_details` VALUES (1,2,1,1,1,2,2.0000,15990.0000,500.0000,2878.0000,34358.0000,'2026-05-01 22:33:19','2026-05-01 22:33:19'),(2,2,1,2,1,2,1.0000,8990.0000,0.0000,1708.0000,10698.0000,'2026-05-01 22:33:19','2026-05-01 22:33:19'),(5,2,2,1,1,2,3.0000,16000.0000,500.0000,9025.0000,56525.0000,'2026-05-01 22:45:17','2026-05-01 22:45:17'),(7,2,3,1,2,2,3.0000,12000.0000,500.0000,6745.0000,42245.0000,'2026-05-02 02:06:43','2026-05-02 02:06:43'),(9,2,4,1,2,2,3.0000,12000.0000,500.0000,6745.0000,42245.0000,'2026-05-02 02:17:37','2026-05-02 02:17:37'),(11,2,5,1,2,2,3.0000,12000.0000,500.0000,6745.0000,42245.0000,'2026-05-02 02:17:59','2026-05-02 02:17:59'),(13,2,6,1,2,2,3.0000,12000.0000,500.0000,6745.0000,42245.0000,'2026-05-02 02:18:01','2026-05-02 02:18:01');
/*!40000 ALTER TABLE `document_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_document_details_ai_generate_movements` AFTER INSERT ON `document_details` FOR EACH ROW INSERT INTO `inventory_movements` (
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
  AND COALESCE(NEW.`warehouse_id`, `d`.`warehouse_id`) IS NOT NULL; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_document_details_au_generate_movements` AFTER UPDATE ON `document_details` FOR EACH ROW INSERT INTO `inventory_movements` (
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
) AS `src`; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_document_details_ad_generate_movements` AFTER DELETE ON `document_details` FOR EACH ROW INSERT INTO `inventory_movements` (
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
  AND COALESCE(OLD.`warehouse_id`, `d`.`warehouse_id`) IS NOT NULL */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `document_sequences`
--

DROP TABLE IF EXISTS `document_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_sequences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `document_type_id` bigint unsigned NOT NULL,
  `year_num` smallint unsigned NOT NULL,
  `next_number` bigint unsigned NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_document_sequences_scope` (`company_id`,`document_type_id`,`year_num`),
  KEY `fk_document_sequences_type` (`document_type_id`),
  CONSTRAINT `fk_document_sequences_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_document_sequences_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_sequences`
--

LOCK TABLES `document_sequences` WRITE;
/*!40000 ALTER TABLE `document_sequences` DISABLE KEYS */;
INSERT INTO `document_sequences` VALUES (1,2,1,2026,102,'2026-05-01 21:43:37','2026-05-01 21:43:37'),(2,2,2,2026,29,'2026-05-01 21:43:37','2026-05-01 21:43:37');
/*!40000 ALTER TABLE `document_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_types`
--

DROP TABLE IF EXISTS `document_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `counterpart_scope` enum('CUSTOMER','SUPPLIER','NONE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NONE',
  `affects_inventory` tinyint(1) NOT NULL DEFAULT '0',
  `affects_accounting` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_document_types_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES (1,'DEMO_FACTURA','Factura Demo','CUSTOMER',0,1,'2026-05-01 21:43:37',NULL),(2,'DEMO_GUIA','Guía Demo','CUSTOMER',1,0,'2026-05-01 21:43:37',NULL);
/*!40000 ALTER TABLE `document_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `document_type_id` bigint unsigned NOT NULL,
  `sequence_number` bigint unsigned NOT NULL,
  `document_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `warehouse_id` bigint unsigned DEFAULT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `status` enum('DRAFT','CONFIRMED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `subtotal` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `tax_total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `discount_total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_documents_scope_number` (`company_id`,`document_type_id`,`sequence_number`),
  KEY `fk_documents_customer` (`customer_id`),
  KEY `fk_documents_supplier` (`supplier_id`),
  KEY `fk_documents_type` (`document_type_id`),
  KEY `fk_documents_warehouse` (`warehouse_id`),
  KEY `idx_documents_company_date` (`company_id`,`document_date`),
  KEY `idx_documents_company_status` (`company_id`,`status`),
  KEY `idx_documents_company_type_date_status` (`company_id`,`document_type_id`,`document_date`,`status`),
  CONSTRAINT `fk_documents_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_documents_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_documents_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `fk_documents_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`),
  CONSTRAINT `fk_documents_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,2,1,9001,'2026-05-01 22:33:19',2,5,NULL,'CONFIRMED',40970.0000,4586.0000,500.0000,45056.0000,'Documento demo generado por seed documents.seed.sql','2026-05-01 22:33:19','2026-05-01 22:33:19','2026-05-01 22:33:19',NULL,2),(2,2,1,101,'2026-05-01 00:00:00',2,1,NULL,'CONFIRMED',48000.0000,9025.0000,500.0000,56525.0000,'E2E update','2026-05-01 22:45:17','2026-05-01 22:45:17','2026-05-01 22:45:17','2026-05-01 22:45:17',6),(3,2,2,25,'2026-05-02 00:00:00',2,1,NULL,'CONFIRMED',36000.0000,6745.0000,500.0000,42245.0000,'Smoke test sale confirmed','2026-05-02 02:06:43','2026-05-02 02:06:42','2026-05-02 02:06:43','2026-05-02 02:06:43',12),(4,2,2,26,'2026-05-02 00:00:00',2,1,NULL,'CONFIRMED',36000.0000,6745.0000,500.0000,42245.0000,'Smoke test document confirmed','2026-05-02 02:17:37','2026-05-02 02:17:37','2026-05-02 02:17:37','2026-05-02 02:17:37',13),(5,2,2,27,'2026-05-02 00:00:00',2,1,NULL,'CONFIRMED',36000.0000,6745.0000,500.0000,42245.0000,'Smoke test document confirmed','2026-05-02 02:17:59','2026-05-02 02:17:59','2026-05-02 02:17:59','2026-05-02 02:17:59',14),(6,2,2,28,'2026-05-02 00:00:00',2,1,NULL,'CONFIRMED',36000.0000,6745.0000,500.0000,42245.0000,'Smoke test sale confirmed','2026-05-02 02:18:01','2026-05-02 02:18:01','2026-05-02 02:18:01','2026-05-02 02:18:01',17);
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_documents_au_generate_movements` AFTER UPDATE ON `documents` FOR EACH ROW INSERT INTO `inventory_movements` (
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
  AND COALESCE(`dd`.`warehouse_id`, NEW.`warehouse_id`) IS NOT NULL; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `product_variant_id` bigint unsigned NOT NULL,
  `quantity_on_hand` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `quantity_reserved` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `quantity_available` decimal(18,4) DEFAULT NULL,
  `min_stock` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `max_stock` decimal(18,4) DEFAULT NULL,
  `reorder_point` decimal(18,4) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inventory_scope` (`company_id`,`warehouse_id`,`product_variant_id`),
  KEY `fk_inventory_variant` (`product_variant_id`),
  KEY `fk_inventory_warehouse` (`warehouse_id`),
  KEY `idx_inventory_company_variant` (`company_id`,`product_variant_id`),
  KEY `idx_inventory_company_warehouse` (`company_id`,`warehouse_id`),
  CONSTRAINT `fk_inventory_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `chk_inventory_available_formula` CHECK ((`quantity_available` = (`quantity_on_hand` - `quantity_reserved`))),
  CONSTRAINT `chk_inventory_non_negative` CHECK (((`quantity_on_hand` >= 0) and (`quantity_reserved` >= 0) and (`quantity_available` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,2,5,2,150.0000,10.0000,140.0000,10.0000,500.0000,30.0000,'2026-05-01 23:48:44','2026-05-02 02:18:00'),(2,2,5,3,3.0000,0.0000,3.0000,10.0000,200.0000,10.0000,'2026-05-01 23:48:44','2026-05-01 23:48:44');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_bi_set_available` BEFORE INSERT ON `inventory` FOR EACH ROW SET NEW.`quantity_available` = IFNULL(NEW.`quantity_on_hand`, 0.0000) - IFNULL(NEW.`quantity_reserved`, 0.0000); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_bu_set_available` BEFORE UPDATE ON `inventory` FOR EACH ROW SET NEW.`quantity_available` = IFNULL(NEW.`quantity_on_hand`, 0.0000) - IFNULL(NEW.`quantity_reserved`, 0.0000); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `inventory_movement_types`
--

DROP TABLE IF EXISTS `inventory_movement_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_movement_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` enum('IN','OUT','TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inventory_movement_types_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_movement_types`
--

LOCK TABLES `inventory_movement_types` WRITE;
/*!40000 ALTER TABLE `inventory_movement_types` DISABLE KEYS */;
INSERT INTO `inventory_movement_types` VALUES (1,'STOCK_IN','Ingreso de inventario','IN','2026-05-02 18:29:36'),(2,'STOCK_OUT','Salida de inventario','OUT','2026-05-02 18:29:36'),(3,'POS_SALE','Salida por venta POS','OUT','2026-05-02 18:29:36'),(4,'POS_SALE_CANCEL','Reversa por anulacion de venta POS','IN','2026-05-02 18:29:36'),(5,'TRANSFER','Transferencia entre bodegas','TRANSFER','2026-05-02 18:29:36'),(6,'ADJUST_IN','Ajuste positivo','IN','2026-05-02 18:29:36'),(7,'ADJUST_OUT','Ajuste negativo','OUT','2026-05-02 18:29:36');
/*!40000 ALTER TABLE `inventory_movement_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_movements`
--

DROP TABLE IF EXISTS `inventory_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `movement_type_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `related_warehouse_id` bigint unsigned DEFAULT NULL,
  `product_variant_id` bigint unsigned NOT NULL,
  `quantity` decimal(18,4) NOT NULL,
  `unit_cost` decimal(18,4) DEFAULT NULL,
  `movement_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_document_type` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_document_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_inventory_movements_related_warehouse` (`related_warehouse_id`),
  KEY `fk_inventory_movements_type` (`movement_type_id`),
  KEY `fk_inventory_movements_variant` (`product_variant_id`),
  KEY `fk_inventory_movements_warehouse` (`warehouse_id`),
  KEY `idx_inventory_movements_company_date` (`company_id`,`movement_date`),
  KEY `idx_inventory_movements_company_type_date` (`company_id`,`movement_type_id`,`movement_date`),
  KEY `idx_inventory_movements_company_variant` (`company_id`,`product_variant_id`),
  KEY `idx_inventory_movements_company_warehouse` (`company_id`,`warehouse_id`),
  CONSTRAINT `fk_inventory_movements_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_inventory_movements_related_warehouse` FOREIGN KEY (`related_warehouse_id`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `fk_inventory_movements_type` FOREIGN KEY (`movement_type_id`) REFERENCES `inventory_movement_types` (`id`),
  CONSTRAINT `fk_inventory_movements_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `fk_inventory_movements_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `chk_inventory_movements_quantity_positive` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_movements`
--

LOCK TABLES `inventory_movements` WRITE;
/*!40000 ALTER TABLE `inventory_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_movements` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_movements_ai_audit` AFTER INSERT ON `inventory_movements` FOR EACH ROW INSERT INTO `audit_logs` (
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
); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_movements_ai_apply_stock` AFTER INSERT ON `inventory_movements` FOR EACH ROW UPDATE `inventory` `i`
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
  `i`.`updated_at` = UTC_TIMESTAMP(); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_movements_ai_apply_stock_insert_missing` AFTER INSERT ON `inventory_movements` FOR EACH ROW INSERT INTO `inventory` (
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
  ) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_movements_au_audit` AFTER UPDATE ON `inventory_movements` FOR EACH ROW INSERT INTO `audit_logs` (
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
); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_inventory_movements_ad_audit` AFTER DELETE ON `inventory_movements` FOR EACH ROW INSERT INTO `audit_logs` (
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
); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `models` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `brand_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_models_company_code` (`company_id`,`code`),
  KEY `idx_models_brand` (`brand_id`),
  CONSTRAINT `fk_models_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `fk_models_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `models`
--

LOCK TABLES `models` WRITE;
/*!40000 ALTER TABLE `models` DISABLE KEYS */;
/*!40000 ALTER TABLE `models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requires_reference` tinyint(1) NOT NULL DEFAULT '0',
  `is_cash` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_methods_company_code` (`company_id`,`code`),
  CONSTRAINT `fk_payment_methods_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_code` (`code`),
  KEY `idx_permissions_module` (`module_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_terminals`
--

DROP TABLE IF EXISTS `pos_terminals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_terminals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pos_terminals_company_code` (`company_id`,`code`),
  KEY `fk_pos_terminals_warehouse` (`warehouse_id`),
  KEY `idx_pos_terminals_company_warehouse` (`company_id`,`warehouse_id`),
  CONSTRAINT `fk_pos_terminals_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_pos_terminals_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_terminals`
--

LOCK TABLES `pos_terminals` WRITE;
/*!40000 ALTER TABLE `pos_terminals` DISABLE KEYS */;
INSERT INTO `pos_terminals` VALUES (1,2,3,'DEMO-POS-TERM-FREE','Terminal POS Demo Libre','POS-DEMO-FREE-01','SN-DEMO-FREE-01',1,'2026-05-01 23:20:03','2026-05-01 23:20:03',NULL),(2,2,3,'DEMO-POS-TERM-LOCK','Terminal POS Demo Bloqueada','POS-DEMO-LOCK-01','SN-DEMO-LOCK-01',1,'2026-05-01 23:20:03','2026-05-01 23:20:03',NULL),(3,2,3,'SMOKE-POS-1777677895539','Terminal Smoke Test Updated','SMOKE-DEVICE-02','SMOKE-SN-UPD-1777677895587',0,'2026-05-01 23:24:56','2026-05-01 23:24:56','2026-05-01 23:24:56'),(4,2,4,'DEMO-CASH-TERM','Terminal Demo Cajas','POS-CASH-DEMO-01','SN-CASH-DEMO-01',1,'2026-05-01 23:29:29','2026-05-01 23:29:29',NULL);
/*!40000 ALTER TABLE `pos_terminals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `asset_id` bigint unsigned NOT NULL,
  `purpose` enum('PRIMARY','GALLERY','THUMBNAIL','DETAIL','PACKAGING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GALLERY',
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` smallint unsigned NOT NULL DEFAULT '1',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `primary_product_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_images_company_product_asset` (`company_id`,`product_id`,`asset_id`),
  UNIQUE KEY `uk_product_images_company_product_sort` (`company_id`,`product_id`,`sort_order`),
  UNIQUE KEY `uk_product_images_one_primary` (`company_id`,`primary_product_id`),
  KEY `fk_product_images_product` (`product_id`),
  KEY `idx_product_images_asset` (`asset_id`),
  KEY `idx_product_images_company_listing` (`company_id`,`product_id`,`is_primary`,`sort_order`),
  KEY `idx_product_images_company_product_active` (`company_id`,`product_id`,`is_active`),
  CONSTRAINT `fk_product_images_asset` FOREIGN KEY (`asset_id`) REFERENCES `digital_assets` (`id`),
  CONSTRAINT `fk_product_images_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,2,1,1,'GALLERY','Imagen demo vinculada (hero)',1,0,1,'2026-05-01 21:02:06','2026-05-01 21:02:06',NULL,2,NULL),(2,2,1,2,'GALLERY','Imagen demo vinculada (thumb)',2,0,1,'2026-05-01 21:02:06','2026-05-01 21:02:06',NULL,2,NULL);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `variant_code` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attributes_json` json DEFAULT NULL,
  `sku` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_price` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `sale_price` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_variants_company_code` (`company_id`,`variant_code`),
  UNIQUE KEY `uk_product_variants_company_barcode` (`company_id`,`barcode`),
  UNIQUE KEY `uk_product_variants_company_sku` (`company_id`,`sku`),
  KEY `idx_product_variants_product` (`product_id`),
  CONSTRAINT `fk_product_variants_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_product_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,2,2,'DEMO-DOC-VAR-001','Variante Demo Documento','{\"uso\": \"document_detail\", \"origen\": \"seed\"}','DEMO-DOC-VAR-001','7800000002002',7000.0000,15990.0000,1,'2026-05-01 22:33:18','2026-05-01 22:33:18',NULL),(2,2,3,'DEMO-INV-VAR-A','Variante Demo A',NULL,'SKU-INV-DEMO-A',NULL,0.0000,0.0000,1,'2026-05-01 23:48:44','2026-05-01 23:48:44',NULL),(3,2,3,'DEMO-INV-VAR-B','Variante Demo B',NULL,'SKU-INV-DEMO-B',NULL,0.0000,0.0000,1,'2026-05-01 23:48:44','2026-05-01 23:48:44',NULL);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `sku` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category_id` bigint unsigned DEFAULT NULL,
  `subcategory_id` bigint unsigned DEFAULT NULL,
  `brand_id` bigint unsigned DEFAULT NULL,
  `model_id` bigint unsigned DEFAULT NULL,
  `base_uom_id` bigint unsigned NOT NULL,
  `tax_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `cost_price` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `sale_price` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `min_price` decimal(18,4) DEFAULT NULL,
  `weight` decimal(10,4) DEFAULT NULL,
  `weight_unit` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'kg',
  `width_cm` decimal(10,4) DEFAULT NULL,
  `height_cm` decimal(10,4) DEFAULT NULL,
  `depth_cm` decimal(10,4) DEFAULT NULL,
  `slug` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_title` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `track_inventory` tinyint(1) NOT NULL DEFAULT '1',
  `min_stock` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `reorder_point` decimal(18,4) DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_count` smallint unsigned NOT NULL DEFAULT '0',
  `is_service` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_products_company_sku` (`company_id`,`sku`),
  UNIQUE KEY `uk_products_company_barcode` (`company_id`,`barcode`),
  UNIQUE KEY `uk_products_company_slug` (`company_id`,`slug`),
  KEY `fk_products_base_uom` (`base_uom_id`),
  KEY `fk_products_brand` (`brand_id`),
  KEY `fk_products_category` (`category_id`),
  KEY `fk_products_model` (`model_id`),
  KEY `fk_products_subcategory` (`subcategory_id`),
  KEY `idx_products_company_name` (`company_id`,`name`),
  KEY `idx_products_featured` (`company_id`,`is_featured`),
  CONSTRAINT `fk_products_base_uom` FOREIGN KEY (`base_uom_id`) REFERENCES `units_of_measure` (`id`),
  CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_products_model` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`),
  CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,'DEMO-DA-001',NULL,'Producto Demo Activos Digitales','Producto técnico para validar dependencias de activos digitales',NULL,NULL,NULL,NULL,1,0.0000,0.0000,0.0000,NULL,NULL,'kg',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0.0000,NULL,NULL,0,0,1,'2026-05-01 21:02:06','2026-05-01 21:02:06',NULL,2),(2,2,'DEMO-DOC-PROD-001','7800000001001','Producto Demo Documento','Producto para validar documento con detalle',NULL,NULL,NULL,NULL,1,0.1900,7000.0000,15990.0000,NULL,NULL,'kg',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0.0000,NULL,NULL,0,0,1,'2026-05-01 22:33:18','2026-05-01 22:33:18',NULL,2),(3,2,'DEMO-INV-PROD',NULL,'Producto Demo Inventario','Producto tecnico para pruebas de inventario',NULL,NULL,NULL,NULL,1,0.0000,0.0000,0.0000,NULL,NULL,'kg',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0.0000,NULL,NULL,0,0,1,'2026-05-01 23:48:44','2026-05-01 23:48:44',NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `country_code` char(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CL',
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_regions_country_code` (`country_code`,`code`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES (1,'CL','I','Región de Tarapacá','2026-04-30 16:29:12','2026-04-30 16:29:12'),(2,'CL','II','Región de Antofagasta','2026-04-30 16:29:36','2026-04-30 16:29:36'),(3,'CL','III','Región de Atacama','2026-04-30 16:29:53','2026-04-30 16:29:53'),(4,'CL','IV','Región de Coquimbo','2026-04-30 16:30:15','2026-04-30 16:30:15'),(5,'CL','V','Región de Valparaíso','2026-04-30 16:30:32','2026-04-30 16:30:32'),(6,'CL','VI','Región del Libertador General Bernardo O Higgins','2026-04-30 16:30:56','2026-04-30 16:30:56'),(7,'CL','VII','Región del Maule','2026-04-30 16:31:19','2026-04-30 16:31:19'),(8,'CL','VIII','Región del Biobío','2026-04-30 16:31:38','2026-04-30 16:31:38'),(9,'CL','IX','Región de La Araucanía','2026-04-30 16:31:55','2026-04-30 16:31:55'),(10,'CL','X','Región de Los Lagos','2026-04-30 16:32:13','2026-04-30 16:32:13'),(11,'CL','XI','Región de Aysén del G. Carlos Ibáñez del Campo','2026-04-30 16:32:29','2026-04-30 16:32:29'),(12,'CL','XII','Región de Magallanes y de la Antártica Chilena','2026-04-30 16:32:50','2026-04-30 16:32:50'),(13,'CL','RM','Región Metropolitana de Santiago','2026-04-30 16:33:07','2026-04-30 16:33:07'),(14,'CL','XIV','Región de Los Ríos','2026-04-30 16:33:24','2026-04-30 16:33:24'),(15,'CL','XV','Región de Arica y Parinacota','2026-04-30 16:34:25','2026-04-30 16:34:25'),(16,'CL','XVI','Región de Ñuble','2026-04-30 16:34:53','2026-04-30 16:34:53');
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  `granted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `granted_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_role_permissions_permission` (`permission_id`),
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_company_code` (`company_id`,`code`),
  KEY `idx_roles_company` (`company_id`),
  CONSTRAINT `fk_roles_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_details`
--

DROP TABLE IF EXISTS `sale_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `sale_id` bigint unsigned NOT NULL,
  `line_number` int unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `product_variant_id` bigint unsigned NOT NULL,
  `quantity` decimal(18,4) NOT NULL,
  `unit_price` decimal(18,4) NOT NULL,
  `discount_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `line_total` decimal(18,4) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sale_details_line` (`sale_id`,`line_number`),
  KEY `fk_sale_details_variant` (`product_variant_id`),
  KEY `fk_sale_details_warehouse` (`warehouse_id`),
  KEY `idx_sale_details_company_variant` (`company_id`,`product_variant_id`),
  CONSTRAINT `fk_sale_details_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_sale_details_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  CONSTRAINT `fk_sale_details_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `fk_sale_details_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_details`
--

LOCK TABLES `sale_details` WRITE;
/*!40000 ALTER TABLE `sale_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sale_details_ai_generate_movements` AFTER INSERT ON `sale_details` FOR EACH ROW INSERT INTO `inventory_movements` (
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
  AND `s`.`status` = 'CONFIRMED'; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sale_details_au_generate_movements` AFTER UPDATE ON `sale_details` FOR EACH ROW INSERT INTO `inventory_movements` (
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
) AS `src`; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sale_details_ad_generate_movements` AFTER DELETE ON `sale_details` FOR EACH ROW INSERT INTO `inventory_movements` (
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
  AND `s`.`status` = 'CONFIRMED'; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `sale_payments`
--

DROP TABLE IF EXISTS `sale_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `sale_id` bigint unsigned NOT NULL,
  `payment_method_id` bigint unsigned NOT NULL,
  `amount` decimal(18,4) NOT NULL,
  `reference_code` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sale_payments_method` (`payment_method_id`),
  KEY `fk_sale_payments_sale` (`sale_id`),
  KEY `idx_sale_payments_company_sale` (`company_id`,`sale_id`),
  CONSTRAINT `fk_sale_payments_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_sale_payments_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`),
  CONSTRAINT `fk_sale_payments_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_payments`
--

LOCK TABLES `sale_payments` WRITE;
/*!40000 ALTER TABLE `sale_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `cash_opening_id` bigint unsigned NOT NULL,
  `terminal_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `document_id` bigint unsigned DEFAULT NULL,
  `sold_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','CONFIRMED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `subtotal` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `tax_total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `discount_total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_customer` (`customer_id`),
  KEY `fk_sales_document` (`document_id`),
  KEY `fk_sales_opening` (`cash_opening_id`),
  KEY `fk_sales_terminal` (`terminal_id`),
  KEY `idx_sales_company_date` (`company_id`,`sold_at`),
  KEY `idx_sales_company_opening_date` (`company_id`,`cash_opening_id`,`sold_at`),
  KEY `idx_sales_company_status` (`company_id`,`status`),
  CONSTRAINT `fk_sales_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_sales_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_sales_opening` FOREIGN KEY (`cash_opening_id`) REFERENCES `cash_openings` (`id`),
  CONSTRAINT `fk_sales_terminal` FOREIGN KEY (`terminal_id`) REFERENCES `pos_terminals` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sales_au_generate_movements` AFTER UPDATE ON `sales` FOR EACH ROW INSERT INTO `inventory_movements` (
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
WHERE `sd`.`sale_id` = NEW.`id`; */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `subcategories`
--

DROP TABLE IF EXISTS `subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subcategories_company_code` (`company_id`,`code`),
  KEY `idx_subcategories_category` (`category_id`),
  CONSTRAINT `fk_subcategories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_subcategories_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategories`
--

LOCK TABLES `subcategories` WRITE;
/*!40000 ALTER TABLE `subcategories` DISABLE KEYS */;
/*!40000 ALTER TABLE `subcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_contacts`
--

DROP TABLE IF EXISTS `supplier_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `supplier_id` bigint unsigned NOT NULL,
  `full_name` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_supplier_contacts_supplier` (`supplier_id`),
  KEY `idx_supplier_contacts_company_supplier` (`company_id`,`supplier_id`),
  CONSTRAINT `fk_supplier_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_supplier_contacts_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_contacts`
--

LOCK TABLES `supplier_contacts` WRITE;
/*!40000 ALTER TABLE `supplier_contacts` DISABLE KEYS */;
INSERT INTO `supplier_contacts` VALUES (1,2,2,'Rodrigo Antonio Moraga Garrido','rodrigomoraga@ventas.cl','+56 9 8478 1159','Vendedor',0,'2026-05-02 01:42:22','2026-05-02 01:42:22',NULL);
/*!40000 ALTER TABLE `supplier_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legal_name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_activity` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commune_id` bigint unsigned DEFAULT NULL,
  `payment_terms_days` smallint unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_suppliers_company_code` (`company_id`,`code`),
  KEY `fk_suppliers_commune` (`commune_id`),
  KEY `idx_suppliers_company_name` (`company_id`,`legal_name`),
  KEY `idx_suppliers_company_tax` (`company_id`,`tax_id`),
  CONSTRAINT `fk_suppliers_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`),
  CONSTRAINT `fk_suppliers_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,2,'PRO-1001','85.777.888-9','Transportes del Valle S.A.','TransValle','info@transvalle.cl','+56 9 8699 9000','Av. Argentina # 567',44,10,1,'2026-04-30 21:57:55','2026-04-30 21:57:55',NULL,2),(2,2,'PRO-1002','86.888.999-K','Inversiones Cordillera SpA','Cordillera','contacto@cordillera.cl','+56 9 8511 1222','Av. Apoquindo # 3456',14,10,1,'2026-04-30 22:00:04','2026-04-30 22:00:04',NULL,2);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_conversions`
--

DROP TABLE IF EXISTS `unit_conversions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_conversions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `from_unit_id` bigint unsigned NOT NULL,
  `to_unit_id` bigint unsigned NOT NULL,
  `factor` decimal(18,8) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_unit_conversions_pair` (`company_id`,`from_unit_id`,`to_unit_id`),
  KEY `fk_unit_conversions_from_uom` (`from_unit_id`),
  KEY `fk_unit_conversions_to_uom` (`to_unit_id`),
  CONSTRAINT `fk_unit_conversions_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_unit_conversions_from_uom` FOREIGN KEY (`from_unit_id`) REFERENCES `units_of_measure` (`id`),
  CONSTRAINT `fk_unit_conversions_to_uom` FOREIGN KEY (`to_unit_id`) REFERENCES `units_of_measure` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_conversions`
--

LOCK TABLES `unit_conversions` WRITE;
/*!40000 ALTER TABLE `unit_conversions` DISABLE KEYS */;
/*!40000 ALTER TABLE `unit_conversions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units_of_measure`
--

DROP TABLE IF EXISTS `units_of_measure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `units_of_measure` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_base_unit` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uom_company_code` (`company_id`,`code`),
  UNIQUE KEY `uk_uom_single_base_per_type` ((if(((`is_base_unit` = true) and (`deleted_at` is null)),concat(`company_id`,_utf8mb4'_',`unit_type`),NULL))),
  KEY `idx_uom_company_type` (`company_id`,`unit_type`),
  CONSTRAINT `fk_uom_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units_of_measure`
--

LOCK TABLES `units_of_measure` WRITE;
/*!40000 ALTER TABLE `units_of_measure` DISABLE KEYS */;
INSERT INTO `units_of_measure` VALUES (1,2,'UN','Unidad','un','count',1,'2026-05-01 21:02:06','2026-05-02 05:34:31',NULL),(2,2,'MTR','Metro','m','Longitud',1,'2026-05-02 04:27:11','2026-05-02 05:34:31',NULL),(3,2,'KGM','Kilogramo','kg','Otro',0,'2026-05-02 04:28:09','2026-05-02 05:34:31',NULL),(4,2,'AMP','Amperio','A','Otro',1,'2026-05-02 04:29:58','2026-05-02 04:55:29',NULL),(5,2,'KEL','Kelvin','K','Otro',0,'2026-05-02 04:31:14','2026-05-02 04:55:29',NULL),(6,2,'MOL','Mol','mol','Otro',0,'2026-05-02 04:32:33','2026-05-02 04:55:29',NULL),(7,2,'CDL','Candela','cd','Otro',0,'2026-05-02 04:54:37','2026-05-02 04:55:29',NULL),(12,2,'TEST_BASE1','Base 1 Updated','B1','TEST_TYPE',0,'2026-05-02 05:23:06','2026-05-02 05:47:32','2026-05-02 05:47:46'),(13,2,'TEST_NONBASE1','NonBase 1','NB1','TEST_TYPE',1,'2026-05-02 05:23:06','2026-05-02 05:23:06','2026-05-02 05:47:42'),(14,2,'TEST_NONBASE2','NonBase 2','NB2','TEST_TYPE',0,'2026-05-02 05:23:06','2026-05-02 05:23:06','2026-05-02 05:47:49');
/*!40000 ALTER TABLE `units_of_measure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `terminal_id` bigint unsigned DEFAULT NULL,
  `device_fingerprint` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_sessions_user` (`user_id`),
  KEY `idx_user_sessions_company_user_active` (`company_id`,`user_id`,`is_active`),
  KEY `idx_user_sessions_login` (`login_at`),
  CONSTRAINT `fk_user_sessions_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `full_name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_company_email` (`company_id`,`email`),
  KEY `idx_users_company_active` (`company_id`,`is_active`),
  CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,2,'Super Administrador','superadmin@integra360.cl','$2a$10$y5erxnqJtcvsEBkHEMXb2unB48lJfNdMpzXlQ4uKYkfueghZR4FVG',1,NULL,'2026-04-27 20:17:54','2026-04-27 20:17:54',NULL,NULL),(3,2,'Rodrigo Moraga','rmoraga@integra360.cl','$2a$10$HHCieosQYtynYsGunDCFUeJzg01ilWSja0tzOTTgU2uIfpZ5cMb56',1,NULL,'2026-04-28 04:14:37','2026-04-28 04:14:37',NULL,2),(4,2,'E2E Documents','e2e.docs.1777675176@integra360.local','$2a$10$2lBxrC5r5TGumz/1ieAqrulLtwrmQnA0hhl2fQeH5dQ7V8c4ucGGK',1,NULL,'2026-05-01 22:39:39','2026-05-01 22:39:39',NULL,NULL),(5,2,'E2E Documents','e2e.docs.1777675203@integra360.local','$2a$10$n34Yk2zqxY/63ICn3hR4AemEEglcZmT1Dc6T8gIjHTsqTE8U0DNVC',1,NULL,'2026-05-01 22:40:05','2026-05-01 22:40:05',NULL,NULL),(6,2,'E2E Documents','e2e.docs.1777675514@integra360.local','$2a$10$IvqjKlmy9Xlby2DhE1MjKeuA3bJ.zV5MhkgacVkTjd.DHyo7hsgt2',1,NULL,'2026-05-01 22:45:16','2026-05-01 22:45:16',NULL,NULL),(7,2,'Smoke POS User','smoke_pos_1777677747683@integra360.test','$2a$10$jDMW9XgYdasp6T8WlBwKfeS0SO7tu/lE.hobi86BRq0w8ooCCNYni',1,NULL,'2026-05-01 23:22:28','2026-05-01 23:22:28',NULL,NULL),(8,2,'Smoke POS User','smoke_pos_1777677894658@integra360.test','$2a$10$8Sq9NiHXQZexzJhLie0LNOf3u7P6RX3nHSD4dQXA0DECRSMRBLOjS',1,NULL,'2026-05-01 23:24:55','2026-05-01 23:24:55',NULL,NULL),(9,2,'Smoke Cash User','smoke_cash_1777678273670@integra360.test','$2a$10$PwS1scAXDnMbHQxQtSJnn.Rr2XdjVv0xXsfpoInjvVF3FDviU5XoG',1,NULL,'2026-05-01 23:31:14','2026-05-01 23:31:14',NULL,NULL),(10,2,'Smoke Inventory User','smoke_inventory_1777679462333@integra360.test','$2a$10$ArN1.O2T1Kz4xgY.VXxZhuj70tgrHr4bOC9SeOzsTcWrIHB3wZoJ6',1,NULL,'2026-05-01 23:51:03','2026-05-01 23:51:03',NULL,NULL),(11,2,'Smoke Sales User','smoke_sales_1777687548995@integra360.test','$2a$10$Ke5VAvTn7cxcyCfD1uxFOe0TPvlcwOWNnzMCRmNt.iz3C.ikzj73u',1,NULL,'2026-05-02 02:05:49','2026-05-02 02:05:49',NULL,NULL),(12,2,'Smoke Sales User','smoke_sales_1777687601733@integra360.test','$2a$10$q20mB9bT3F9vmDbjfXwzCuKUrIYQ7nxEt9rS2VOPJcqj5qNTfxJX.',1,NULL,'2026-05-02 02:06:42','2026-05-02 02:06:42',NULL,NULL),(13,2,'Smoke Documents User','smoke_docs_1777688256485@integra360.test','$2a$10$0gCrAUBg4KmR/.qTaSOkgeWi9sYmQwgsxBXeFdZGSC3JXCtZhzwvC',1,NULL,'2026-05-02 02:17:37','2026-05-02 02:17:37',NULL,NULL),(14,2,'Smoke Documents User','smoke_docs_1777688278111@integra360.test','$2a$10$qbxmyUwGBg5bafjUCOjI/ONvSm0Hcl0NE6al3jtfT9wbziySe1gd.',1,NULL,'2026-05-02 02:17:58','2026-05-02 02:17:58',NULL,NULL),(15,2,'Smoke Inventory User','smoke_inventory_1777688278914@integra360.test','$2a$10$dGmnZhwk5mFW4y2wPMDAhOJ7CxtGEKjDa2X1zGoavtcpa28i2dplS',1,NULL,'2026-05-02 02:17:59','2026-05-02 02:17:59',NULL,NULL),(16,2,'Smoke Cash User','smoke_cash_1777688279850@integra360.test','$2a$10$V0aAralzvJEZEnxGzUAwx.PO23Bu2UZSDgBzKmq9WhPGHMmBLoLO6',1,NULL,'2026-05-02 02:18:00','2026-05-02 02:18:00',NULL,NULL),(17,2,'Smoke Sales User','smoke_sales_1777688280606@integra360.test','$2a$10$QhrnJl6EoAl8eVNDrjmKn.nkQGXd7ZcC9L4lVWCo3jycwWvlFuVzi',1,NULL,'2026-05-02 02:18:01','2026-05-02 02:18:01',NULL,NULL),(18,2,'QA Scroll Usuario','qa.scroll.20260502@example.com','$2a$10$wAm89IiZ26OREbUpXmuf5eT186QT0nJa6VW5crKr2KRgVfhZqQzi2',1,NULL,'2026-05-02 02:46:47','2026-05-02 02:46:47',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint unsigned NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commune_id` bigint unsigned DEFAULT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_warehouses_company_code` (`company_id`,`code`),
  KEY `fk_warehouses_commune` (`commune_id`),
  KEY `idx_warehouses_company_active` (`company_id`,`is_active`),
  CONSTRAINT `fk_warehouses_commune` FOREIGN KEY (`commune_id`) REFERENCES `communes` (`id`),
  CONSTRAINT `fk_warehouses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,2,'BOD-101','Casa Matriz','Av. San Miguel # 2736',58,1,1,'2026-04-30 21:43:24','2026-04-30 21:43:24',NULL),(2,2,'DEMO-DOC-WH','Bodega Demo Documentos','Bodega técnica para semillas de documentos',NULL,1,1,'2026-05-01 22:33:18','2026-05-01 22:33:18',NULL),(3,2,'DEMO-POS-WH','Bodega Demo POS','Bodega tecnica para terminales POS demo',NULL,0,1,'2026-05-01 23:20:03','2026-05-01 23:20:03',NULL),(4,2,'DEMO-CASH-WH','Bodega Demo Cajas','Bodega tecnica para cajas demo',NULL,0,1,'2026-05-01 23:29:29','2026-05-01 23:29:29',NULL),(5,2,'DEMO-INV-WH','Bodega Demo Inventario','Bodega tecnica para inventario demo',NULL,0,1,'2026-05-01 23:45:53','2026-05-01 23:45:53',NULL);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-02 14:40:33
