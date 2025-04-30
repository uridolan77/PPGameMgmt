-- Optimize database performance for pp_recommeder_db
USE pp_recommeder_db;

-- Add indexes to commonly queried tables if they don't exist

-- Players table indexes
CREATE INDEX IF NOT EXISTS idx_players_segment ON players(segment);
CREATE INDEX IF NOT EXISTS idx_players_country ON players(country);
CREATE INDEX IF NOT EXISTS idx_players_last_login_date ON players(last_login_date);

-- Games table indexes (in addition to existing ones)
CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date);
CREATE INDEX IF NOT EXISTS idx_games_rtp ON games(rtp);
CREATE INDEX IF NOT EXISTS idx_games_popularity_score ON games(popularity_score);

-- Bonuses table indexes
CREATE INDEX IF NOT EXISTS idx_bonuses_is_active ON bonuses(is_active);
CREATE INDEX IF NOT EXISTS idx_bonuses_start_date ON bonuses(start_date);
CREATE INDEX IF NOT EXISTS idx_bonuses_end_date ON bonuses(end_date);
CREATE INDEX IF NOT EXISTS idx_bonuses_target_segment ON bonuses(target_segment);

-- Game sessions table indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_game_sessions_end_time ON game_sessions(end_time);

-- Analyze tables to update statistics (MySQL)
ANALYZE TABLE players;
ANALYZE TABLE games;
ANALYZE TABLE bonuses;
ANALYZE TABLE game_sessions;
ANALYZE TABLE outbox_messages;

-- Show table status to check fragmentation
SHOW TABLE STATUS LIKE 'players';
SHOW TABLE STATUS LIKE 'games';
SHOW TABLE STATUS LIKE 'bonuses';
SHOW TABLE STATUS LIKE 'game_sessions';
SHOW TABLE STATUS LIKE 'outbox_messages';
