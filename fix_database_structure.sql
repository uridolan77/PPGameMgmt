-- Fix database structure for pp_recommeder_db
USE pp_recommeder_db;

-- Fix games table structure
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS popularity_score INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS compatible_devices JSON NULL,
ADD COLUMN IF NOT EXISTS features JSON NULL,
ADD COLUMN IF NOT EXISTS volatility VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Make sure the column names match what the application expects
-- Based on the Game entity in PPGameMgmt.Core\Entities\Game.cs
ALTER TABLE games 
CHANGE COLUMN id id VARCHAR(50) NOT NULL,
CHANGE COLUMN name name VARCHAR(100) NOT NULL,
CHANGE COLUMN provider provider VARCHAR(50) NOT NULL,
CHANGE COLUMN type type VARCHAR(50) NOT NULL,
CHANGE COLUMN category category VARCHAR(50) NOT NULL,
CHANGE COLUMN genre genre VARCHAR(50) NOT NULL,
CHANGE COLUMN description description VARCHAR(500) NOT NULL,
CHANGE COLUMN is_featured is_featured BOOLEAN NOT NULL DEFAULT FALSE,
CHANGE COLUMN rtp rtp DECIMAL(5,2) NOT NULL DEFAULT 0,
CHANGE COLUMN minimum_bet minimum_bet DECIMAL(18,2) NOT NULL DEFAULT 0,
CHANGE COLUMN maximum_bet maximum_bet DECIMAL(18,2) NOT NULL DEFAULT 0,
CHANGE COLUMN release_date release_date DATETIME NOT NULL,
CHANGE COLUMN thumbnail_url thumbnail_url VARCHAR(200) NOT NULL,
CHANGE COLUMN game_url game_url VARCHAR(200) NOT NULL,
CHANGE COLUMN popularity_score popularity_score INT NOT NULL DEFAULT 0;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_games_type ON games(type);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_provider ON games(provider);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active);

-- Insert sample data if the table is empty
INSERT INTO games (id, name, provider, type, category, genre, description, is_featured, rtp, minimum_bet, maximum_bet, release_date, thumbnail_url, game_url, is_active, popularity_score)
SELECT 'game1', 'Starburst', 'NetEnt', 'Slot', 'Video', 'Space', 'A popular space-themed slot game with expanding wilds', TRUE, 96.1, 0.10, 100.00, '2022-01-01', 'https://example.com/starburst.jpg', 'https://example.com/play/starburst', TRUE, 100
WHERE NOT EXISTS (SELECT 1 FROM games LIMIT 1);

INSERT INTO games (id, name, provider, type, category, genre, description, is_featured, rtp, minimum_bet, maximum_bet, release_date, thumbnail_url, game_url, is_active, popularity_score)
SELECT 'game2', 'Book of Dead', 'Play\'n GO', 'Slot', 'Video', 'Ancient Egypt', 'An Egyptian-themed slot with expanding symbols', FALSE, 96.21, 0.10, 100.00, '2022-02-15', 'https://example.com/bookofdead.jpg', 'https://example.com/play/bookofdead', TRUE, 95
WHERE NOT EXISTS (SELECT 2 FROM games LIMIT 1);

INSERT INTO games (id, name, provider, type, category, genre, description, is_featured, rtp, minimum_bet, maximum_bet, release_date, thumbnail_url, game_url, is_active, popularity_score)
SELECT 'game3', 'Gonzo\'s Quest', 'NetEnt', 'Slot', 'Video', 'Adventure', 'Join Gonzo on his quest for Eldorado with avalanche multipliers', TRUE, 95.97, 0.20, 50.00, '2022-03-10', 'https://example.com/gonzo.jpg', 'https://example.com/play/gonzo', TRUE, 90
WHERE NOT EXISTS (SELECT 3 FROM games LIMIT 1);
