-- Script to check the actual data in the bonuses table
SELECT id, name, type, target_segment, applicable_game_ids, target_segments
FROM bonuses
LIMIT 10;
