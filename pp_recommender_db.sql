-- MySQL script to create pp_recommeder_db database
-- Based on the CasinoDbContext structure

-- Create the database
DROP DATABASE IF EXISTS pp_recommeder_db;
CREATE DATABASE pp_recommeder_db;
USE pp_recommeder_db;

-- Create tables based on entity configurations

-- Player table
CREATE TABLE players (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    language VARCHAR(10),
    registration_date DATETIME NOT NULL,
    last_login_date DATETIME NOT NULL,
    total_deposits DECIMAL(18, 2) NOT NULL,
    total_withdrawals DECIMAL(18, 2) NOT NULL,
    average_deposit_amount DECIMAL(18, 2) NOT NULL,
    login_count INT NOT NULL,
    segment ENUM('New', 'Casual', 'Regular', 'VIP', 'Dormant') NOT NULL,
    age INT NULL,
    gender VARCHAR(10) NULL
);

-- Game table
CREATE TABLE games (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    type ENUM('Slot', 'Table', 'LiveDealer', 'Poker', 'Bingo', 'Scratchcard', 'Virtual', 'Other') NOT NULL,
    category ENUM('Classic', 'Video', 'Progressive', 'VIP', 'New', 'Popular', 'Seasonal', 'Exclusive') NOT NULL,
    genre VARCHAR(50) NULL,
    description VARCHAR(500) NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    rtp DECIMAL(5, 2) NOT NULL,
    minimum_bet DECIMAL(18, 2) NOT NULL,
    maximum_bet DECIMAL(18, 2) NOT NULL,
    release_date DATETIME NOT NULL,
    thumbnail_url VARCHAR(200) NULL,
    game_url VARCHAR(200) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Bonus table
CREATE TABLE bonuses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
    type ENUM('DepositMatch', 'FreeSpins', 'Cashback', 'NoDeposit', 'Reload', 'LoyaltyPoints', 'ReferralBonus', 'TournamentPrize', 'CustomOffer') NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    percentage_match DECIMAL(5, 2) NULL,
    minimum_deposit DECIMAL(18, 2) NULL,
    wagering_requirement INT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    game_id VARCHAR(36) NULL,
    target_segment ENUM('New', 'Casual', 'Regular', 'VIP', 'Dormant') NOT NULL,
    applicable_game_ids JSON NULL,
    target_segments JSON NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
);

-- GameSession table
CREATE TABLE game_sessions (
    id VARCHAR(36) PRIMARY KEY,
    player_id VARCHAR(36) NOT NULL,
    game_id VARCHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    total_bets DECIMAL(18, 2) NOT NULL,
    total_wins DECIMAL(18, 2) NOT NULL,
    total_spins INT NOT NULL DEFAULT 0,
    total_hands INT NOT NULL DEFAULT 0,
    device_type VARCHAR(20) NULL,
    browser_info VARCHAR(200) NULL,
    applied_bonus_id VARCHAR(36) NULL,
    deposit_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    withdrawal_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (applied_bonus_id) REFERENCES bonuses(id) ON DELETE SET NULL
);

-- BonusClaim table
CREATE TABLE bonus_claims (
    id VARCHAR(36) PRIMARY KEY,
    player_id VARCHAR(36) NOT NULL,
    bonus_id VARCHAR(36) NOT NULL,
    claim_date DATETIME NOT NULL,
    claimed_date DATETIME NOT NULL,
    status ENUM('Claimed', 'Active', 'Completed', 'Failed', 'Expired', 'Cancelled') NOT NULL,
    deposit_amount DECIMAL(18, 2) NULL,
    completion_date DATETIME NULL,
    wagering_progress DECIMAL(5, 2) NULL,
    expiry_date DATETIME NULL,
    conversion_trigger VARCHAR(50) NULL,
    bonus_value DECIMAL(18, 2) NOT NULL,
    bonus_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (bonus_id) REFERENCES bonuses(id) ON DELETE CASCADE
);

-- PlayerFeatures table
CREATE TABLE player_features (
    player_id VARCHAR(36) PRIMARY KEY,
    generated_date DATETIME NOT NULL,
    timestamp_utc DATETIME NOT NULL,
    country VARCHAR(50) NULL,
    days_since_registration INT NOT NULL,
    age INT NULL,
    gender VARCHAR(10) NULL,
    favorite_game_type ENUM('Slot', 'Table', 'LiveDealer', 'Poker', 'Bingo', 'Scratchcard', 'Virtual', 'Other') NULL,
    top_played_game_ids JSON NULL,
    average_bet_size DECIMAL(18, 2) NOT NULL,
    average_session_length_minutes INT NOT NULL,
    session_frequency_per_week INT NOT NULL,
    preferred_time_slots JSON NULL,
    preferred_device VARCHAR(20) NOT NULL DEFAULT 'Unknown',
    sessions_per_week DOUBLE NOT NULL DEFAULT 0,
    average_session_duration INT NOT NULL DEFAULT 0,
    days_active_30 INT NOT NULL DEFAULT 0,
    days_active_90 INT NOT NULL DEFAULT 0,
    favorite_game_category VARCHAR(50) NULL,
    preferred_session_time VARCHAR(50) NULL,
    preferred_game_genre VARCHAR(50) NULL,
    session_frequency DOUBLE NOT NULL DEFAULT 0,
    preferred_playing_time_of_day VARCHAR(50) NULL,
    last_active DATETIME NOT NULL,
    total_deposits_last_30_days DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_withdrawals_last_30_days DECIMAL(18, 2) NOT NULL DEFAULT 0,
    average_deposit_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    deposit_frequency_per_month INT NOT NULL DEFAULT 0,
    lifetime_value DECIMAL(18, 2) NOT NULL DEFAULT 0,
    monthly_average_deposit DECIMAL(18, 2) NOT NULL DEFAULT 0,
    typical_deposit_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    bonus_usage_rate DOUBLE NOT NULL DEFAULT 0,
    preferred_bonus_type ENUM('DepositMatch', 'FreeSpins', 'Cashback', 'NoDeposit', 'Reload', 'LoyaltyPoints', 'ReferralBonus', 'TournamentPrize', 'CustomOffer') NULL,
    bonus_to_deposit_conversion_rate DOUBLE NOT NULL DEFAULT 0,
    wagering_completion_rate DOUBLE NOT NULL DEFAULT 0,
    bonus_preference VARCHAR(50) NULL,
    total_bonuses_claimed INT NOT NULL DEFAULT 0,
    referred_others BOOLEAN NOT NULL DEFAULT FALSE,
    total_referrals INT NOT NULL DEFAULT 0,
    risk_score DOUBLE NOT NULL DEFAULT 0,
    churn_probability DOUBLE NOT NULL DEFAULT 0,
    risk_level VARCHAR(20) NULL,
    retention_score INT NOT NULL DEFAULT 0,
    churn_risk DOUBLE NOT NULL DEFAULT 0,
    upsell_potential DOUBLE NOT NULL DEFAULT 0,
    player_lifetime_value DECIMAL(18, 2) NOT NULL DEFAULT 0,
    current_segment ENUM('New', 'Casual', 'Regular', 'VIP', 'Dormant') NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Recommendation table
CREATE TABLE recommendations (
    id VARCHAR(36) PRIMARY KEY,
    player_id VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    is_displayed BOOLEAN NOT NULL DEFAULT FALSE,
    is_clicked BOOLEAN NOT NULL DEFAULT FALSE,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    displayed_at DATETIME NULL,
    clicked_at DATETIME NULL,
    accepted_at DATETIME NULL,
    is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
    is_played BOOLEAN NOT NULL DEFAULT FALSE,
    recommended_games JSON NULL,
    recommended_bonus JSON NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Add indexes to improve query performance
CREATE INDEX idx_players_segment ON players(segment);
CREATE INDEX idx_games_type ON games(type);
CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_bonuses_type ON bonuses(type);
CREATE INDEX idx_bonuses_target_segment ON bonuses(target_segment);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_bonus_claims_player_id ON bonus_claims(player_id);
CREATE INDEX idx_bonus_claims_bonus_id ON bonus_claims(bonus_id);
CREATE INDEX idx_recommendations_player_id ON recommendations(player_id);

-- Add a comment to describe the database
ALTER DATABASE pp_recommeder_db COMMENT = 'Database for the Player Personalized Game Management System - Recommendations';