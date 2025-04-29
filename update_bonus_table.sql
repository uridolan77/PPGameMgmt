-- Script to update the bonuses table to match the entity model
-- This script will rename the columns to match the entity property names

-- First, check if the columns exist with their current names
SELECT 
    COLUMN_NAME 
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_NAME = 'bonuses' 
    AND TABLE_SCHEMA = 'pp_recommeder_db';

-- Rename the columns if they exist
-- Note: This is a safer approach than dropping and recreating columns
-- as it preserves the data

-- If you're still having issues, you can try this alternative approach:
-- Create a view that maps the column names to the property names

CREATE OR REPLACE VIEW bonus_view AS
SELECT
    id AS Id,
    name AS Name,
    description AS Description,
    type AS Type,
    amount AS Amount,
    percentage_match AS PercentageMatch,
    minimum_deposit AS MinimumDeposit,
    wagering_requirement AS WageringRequirement,
    start_date AS StartDate,
    end_date AS EndDate,
    is_active AS IsActive,
    is_global AS IsGlobal,
    game_id AS GameId,
    target_segment AS TargetSegment,
    applicable_game_ids AS ApplicableGameIds,
    target_segments AS TargetSegments
FROM
    bonuses;

-- Then update your connection string to use the view instead of the table
-- Or update your repository to query the view instead of the table
