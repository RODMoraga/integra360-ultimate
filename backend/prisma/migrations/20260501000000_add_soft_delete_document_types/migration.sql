-- AlterTable: Add soft-delete column to document_types
ALTER TABLE `document_types` ADD COLUMN `deleted_at` DATETIME(0) NULL;
