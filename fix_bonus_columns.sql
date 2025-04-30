-- Script to fix the column names in the bonuses table to match entity property names
USE pp_recommeder_db;

-- Check if the table exists first
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = 'pp_recommeder_db' AND table_name = 'bonuses';

-- Only proceed if the table exists
SET @rename_columns = CONCAT('
    -- Rename columns to match entity property expectations
    ALTER TABLE bonuses 
    CHANGE COLUMN start_date valid_from DATETIME NULL,
    CHANGE COLUMN end_date valid_to DATETIME NULL;
');

-- Execute the rename if table exists
SET @sql = IF(@table_exists > 0, @rename_columns, 'SELECT "Bonuses table does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pp_recommeder_db' 
AND TABLE_NAME = 'bonuses'
AND (COLUMN_NAME = 'valid_from' OR COLUMN_NAME = 'valid_to');

-- Check if other potentially problematic columns need to be renamed
-- and list them for reference
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pp_recommeder_db' 
AND TABLE_NAME = 'bonuses'
ORDER BY ORDINAL_POSITION;