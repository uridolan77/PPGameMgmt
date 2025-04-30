-- Fix games table structure in pp_recommeder_db database
USE pp_recommeder_db;

-- Check if columns exist and add them if they don't
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS popularity_score INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS compatible_devices JSON NULL,
ADD COLUMN IF NOT EXISTS features JSON NULL,
ADD COLUMN IF NOT EXISTS volatility VARCHAR(50) NULL;

-- Make sure the column names match what the application expects
-- If you see any column name mismatches in the screenshot, add them here
-- For example, if the application expects 'thumbnail_url' but the DB has 'thumbnail'
-- ALTER TABLE games CHANGE COLUMN thumbnail thumbnail_url VARCHAR(200);

-- Make sure the column types match what the application expects
-- For example, if RTP should be DECIMAL(5,2) but is currently something else
-- ALTER TABLE games MODIFY COLUMN rtp DECIMAL(5,2) NOT NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_games_type ON games(type);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_provider ON games(provider);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active);
