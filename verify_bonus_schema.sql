-- Script to verify the bonuses table schema
-- Run this script to check the actual column names in the database

-- Show the table structure
DESCRIBE bonuses;

-- Check if the applicable_game_ids column exists
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pp_recommeder_db' 
AND TABLE_NAME = 'bonuses' 
AND COLUMN_NAME = 'applicable_game_ids';

-- Check a sample of data to see the actual column values
SELECT id, name, type, applicable_game_ids, target_segments 
FROM bonuses 
LIMIT 5;
