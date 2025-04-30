-- Script to check and fix any issues with bonus data
USE pp_recommeder_db;

-- First, let's check if there are any NULL values in critical fields
SELECT 
  id,
  name,
  is_active,
  valid_from,
  valid_to
FROM bonuses
WHERE valid_from IS NULL
   OR valid_to IS NULL
   OR is_active IS NULL;

-- Fix NULL dates if any exist
UPDATE bonuses
SET valid_from = CURRENT_TIMESTAMP
WHERE valid_from IS NULL;

UPDATE bonuses
SET valid_to = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
WHERE valid_to IS NULL;

-- Fix NULL is_active values
UPDATE bonuses
SET is_active = 1
WHERE is_active IS NULL;

-- Check for improper JSON in applicable_game_ids or target_segments
SELECT 
  id,
  name,
  applicable_game_ids,
  target_segments
FROM bonuses
WHERE 
  (applicable_game_ids IS NOT NULL AND applicable_game_ids NOT LIKE '[%]' AND applicable_game_ids NOT LIKE '[]')
  OR
  (target_segments IS NOT NULL AND target_segments NOT LIKE '[%]' AND target_segments NOT LIKE '[]');

-- Fix any improper JSON array formats
UPDATE bonuses
SET applicable_game_ids = '[]'
WHERE applicable_game_ids IS NOT NULL 
  AND applicable_game_ids NOT LIKE '[%]' 
  AND applicable_game_ids NOT LIKE '[]';

UPDATE bonuses
SET target_segments = '[]'
WHERE target_segments IS NOT NULL 
  AND target_segments NOT LIKE '[%]' 
  AND target_segments NOT LIKE '[]';

-- Verify the columns have the correct names
DESCRIBE bonuses;

-- Count total and active bonuses for verification
SELECT 
  COUNT(*) AS total_bonuses,
  SUM(IF(is_active = 1, 1, 0)) AS active_bonuses,
  SUM(IF(valid_from <= CURRENT_TIMESTAMP AND valid_to >= CURRENT_TIMESTAMP, 1, 0)) AS currently_valid_bonuses,
  SUM(IF(is_active = 1 AND valid_from <= CURRENT_TIMESTAMP AND valid_to >= CURRENT_TIMESTAMP, 1, 0)) AS active_and_valid_bonuses
FROM bonuses;