-- Fix games table in pp_recommeder_db database
USE pp_recommeder_db;

-- Add missing columns to games table if they don't exist
ALTER TABLE games
ADD COLUMN IF NOT EXISTS popularity_score INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS compatible_devices JSON NULL,
ADD COLUMN IF NOT EXISTS features JSON NULL;
