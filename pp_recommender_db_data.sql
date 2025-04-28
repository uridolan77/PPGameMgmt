-- Sample data for pp_recommeder_db
-- Current date reference: April 29, 2025

USE pp_recommeder_db;

-- Sample Players data
INSERT INTO players (id, username, email, country, language, registration_date, last_login_date, total_deposits, total_withdrawals, average_deposit_amount, login_count, segment, age, gender) VALUES
('P001', 'john_player', 'john@example.com', 'USA', 'en', '2023-05-15 10:30:00', '2025-04-28 18:45:00', 5000.00, 3200.00, 100.00, 145, 'Regular', 34, 'Male'),
('P002', 'emma_gamer', 'emma@example.com', 'UK', 'en', '2024-01-20 14:15:00', '2025-04-29 09:15:00', 1200.00, 850.00, 75.00, 52, 'Casual', 29, 'Female'),
('P003', 'michael_vip', 'michael@example.com', 'Germany', 'de', '2022-11-05 09:00:00', '2025-04-27 21:30:00', 25000.00, 18000.00, 500.00, 310, 'VIP', 41, 'Male'),
('P004', 'sofia_slots', 'sofia@example.com', 'Spain', 'es', '2024-03-10 16:45:00', '2025-04-15 11:20:00', 300.00, 150.00, 50.00, 18, 'New', 26, 'Female'),
('P005', 'david_dealer', 'david@example.com', 'Canada', 'en', '2023-08-22 12:30:00', '2025-03-01 14:40:00', 8500.00, 7200.00, 200.00, 89, 'Dormant', 38, 'Male'),
('P006', 'alice_ace', 'alice@example.com', 'Australia', 'en', '2023-04-18 08:20:00', '2025-04-28 22:10:00', 3800.00, 2100.00, 125.00, 102, 'Regular', 33, 'Female'),
('P007', 'robert_royal', 'robert@example.com', 'France', 'fr', '2022-12-10 11:15:00', '2025-04-29 10:05:00', 15000.00, 9800.00, 350.00, 187, 'VIP', 45, 'Male'),
('P008', 'maria_mega', 'maria@example.com', 'Italy', 'it', '2024-02-28 15:30:00', '2025-04-28 17:45:00', 950.00, 400.00, 65.00, 34, 'Casual', 31, 'Female'),
('P009', 'james_jackpot', 'james@example.com', 'USA', 'en', '2023-10-05 10:20:00', '2025-04-29 08:30:00', 7200.00, 4500.00, 180.00, 153, 'Regular', 37, 'Male'),
('P010', 'olivia_odds', 'olivia@example.com', 'UK', 'en', '2024-01-15 13:45:00', '2025-03-15 12:20:00', 2200.00, 1500.00, 90.00, 67, 'Dormant', 28, 'Female');

-- Sample Games data
INSERT INTO games (id, name, provider, type, category, genre, description, is_featured, rtp, minimum_bet, maximum_bet, release_date, thumbnail_url, game_url, is_active) VALUES
('G001', 'Fortune Spins', 'PlayTech', 'Slot', 'Popular', 'Adventure', 'Exciting slot game with multiple bonus features', TRUE, 96.50, 0.10, 100.00, '2024-01-15 00:00:00', 'https://example.com/thumbnails/fortune_spins.jpg', 'https://example.com/games/fortune_spins', TRUE),
('G002', 'Royal Blackjack', 'Evolution', 'Table', 'Classic', 'Card', 'Classic blackjack with side bets and VIP tables', TRUE, 99.10, 1.00, 10000.00, '2023-05-20 00:00:00', 'https://example.com/thumbnails/royal_blackjack.jpg', 'https://example.com/games/royal_blackjack', TRUE),
('G003', 'Live Roulette Pro', 'Evolution', 'LiveDealer', 'VIP', 'Table', 'Professional live dealer roulette with multiple camera angles', TRUE, 97.30, 0.50, 5000.00, '2023-07-10 00:00:00', 'https://example.com/thumbnails/live_roulette_pro.jpg', 'https://example.com/games/live_roulette_pro', TRUE),
('G004', 'Mega Gems', 'NetEnt', 'Slot', 'Progressive', 'Gems', 'Progressive jackpot slot with gem theme', TRUE, 94.20, 0.25, 125.00, '2024-03-01 00:00:00', 'https://example.com/thumbnails/mega_gems.jpg', 'https://example.com/games/mega_gems', TRUE),
('G005', 'Texas Hold''em', 'PokerStars', 'Poker', 'Classic', 'Card', 'Texas Hold''em poker with tournaments and cash games', FALSE, 98.50, 0.10, 1000.00, '2023-11-05 00:00:00', 'https://example.com/thumbnails/texas_holdem.jpg', 'https://example.com/games/texas_holdem', TRUE),
('G006', 'Treasure Island', 'Microgaming', 'Slot', 'Video', 'Adventure', 'Pirate-themed slot with free spins and treasure hunts', FALSE, 95.80, 0.20, 200.00, '2024-02-20 00:00:00', 'https://example.com/thumbnails/treasure_island.jpg', 'https://example.com/games/treasure_island', TRUE),
('G007', 'Lucky Bingo', 'Playtech', 'Bingo', 'New', 'Numbers', 'Modern bingo game with multiple patterns and progressive jackpots', FALSE, 92.50, 0.50, 50.00, '2025-01-10 00:00:00', 'https://example.com/thumbnails/lucky_bingo.jpg', 'https://example.com/games/lucky_bingo', TRUE),
('G008', 'Golden Scratch', 'IGT', 'Scratchcard', 'Popular', 'Instant Win', 'High-paying scratch card with golden theme', FALSE, 91.20, 1.00, 20.00, '2024-10-15 00:00:00', 'https://example.com/thumbnails/golden_scratch.jpg', 'https://example.com/games/golden_scratch', TRUE),
('G009', 'Virtual Derby', 'Betsoft', 'Virtual', 'Seasonal', 'Sports', 'Virtual horse racing with realistic graphics', FALSE, 93.70, 0.25, 500.00, '2024-04-05 00:00:00', 'https://example.com/thumbnails/virtual_derby.jpg', 'https://example.com/games/virtual_derby', TRUE),
('G010', 'Mystic Fortune', 'NetEnt', 'Slot', 'Video', 'Fantasy', 'Fantasy-themed slot with magical features', TRUE, 96.10, 0.10, 150.00, '2024-07-20 00:00:00', 'https://example.com/thumbnails/mystic_fortune.jpg', 'https://example.com/games/mystic_fortune', TRUE),
('G011', 'European Roulette', 'Playtech', 'Table', 'Classic', 'Table', 'Classic European roulette with single zero', FALSE, 97.30, 0.10, 1000.00, '2023-04-10 00:00:00', 'https://example.com/thumbnails/european_roulette.jpg', 'https://example.com/games/european_roulette', TRUE),
('G012', 'Mega Jackpot Slots', 'IGT', 'Slot', 'Progressive', 'Jackpot', 'Multi-million progressive jackpot slot', TRUE, 93.50, 0.50, 100.00, '2023-12-15 00:00:00', 'https://example.com/thumbnails/mega_jackpot_slots.jpg', 'https://example.com/games/mega_jackpot_slots', TRUE),
('G013', 'Caribbean Poker', 'Evolution', 'Poker', 'Classic', 'Card', 'Caribbean poker with progressive side bet', FALSE, 98.20, 1.00, 500.00, '2024-05-10 00:00:00', 'https://example.com/thumbnails/caribbean_poker.jpg', 'https://example.com/games/caribbean_poker', TRUE),
('G014', 'Space Adventure', 'Microgaming', 'Slot', 'New', 'SciFi', 'Space-themed slot with expanding wilds', TRUE, 95.60, 0.20, 200.00, '2025-03-01 00:00:00', 'https://example.com/thumbnails/space_adventure.jpg', 'https://example.com/games/space_adventure', TRUE),
('G015', 'Live Baccarat', 'Evolution', 'LiveDealer', 'VIP', 'Card', 'Live dealer baccarat with squeeze option', FALSE, 98.90, 5.00, 10000.00, '2023-09-20 00:00:00', 'https://example.com/thumbnails/live_baccarat.jpg', 'https://example.com/games/live_baccarat', TRUE);

-- Sample Bonuses data
INSERT INTO bonuses (id, name, description, type, amount, percentage_match, minimum_deposit, wagering_requirement, start_date, end_date, is_active, is_global, game_id, target_segment, applicable_game_ids, target_segments) VALUES
('B001', 'Welcome Bonus', 'First deposit bonus for new players', 'DepositMatch', 100.00, 100.00, 10.00, 35, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, FALSE, NULL, 'New', JSON_ARRAY('G001', 'G004', 'G006', 'G010', 'G012', 'G014'), JSON_ARRAY('New')),
('B002', 'Free Spins Pack', '50 free spins on selected slot games', 'FreeSpins', 50.00, NULL, NULL, 30, '2025-03-01 00:00:00', '2025-05-31 23:59:59', TRUE, TRUE, 'G001', 'Casual', JSON_ARRAY('G001', 'G004', 'G006', 'G010'), JSON_ARRAY('Casual', 'Regular')),
('B003', 'Weekend Cashback', '10% cashback on weekend losses', 'Cashback', 500.00, 10.00, 50.00, 0, '2025-04-01 00:00:00', '2025-06-30 23:59:59', TRUE, FALSE, NULL, 'Regular', NULL, JSON_ARRAY('Regular', 'VIP')),
('B004', 'VIP Bonus', 'Exclusive bonus for VIP players', 'DepositMatch', 1000.00, 50.00, 100.00, 20, '2025-02-15 00:00:00', '2025-12-31 23:59:59', TRUE, FALSE, NULL, 'VIP', NULL, JSON_ARRAY('VIP')),
('B005', 'No Deposit Bonus', 'Free $10 no deposit bonus', 'NoDeposit', 10.00, NULL, NULL, 50, '2025-04-01 00:00:00', '2025-06-30 23:59:59', TRUE, TRUE, NULL, 'New', NULL, JSON_ARRAY('New')),
('B006', 'Reload Bonus', '50% match on deposits', 'Reload', 200.00, 50.00, 20.00, 30, '2025-03-15 00:00:00', '2025-09-15 23:59:59', TRUE, FALSE, NULL, 'Regular', NULL, JSON_ARRAY('Regular', 'Casual')),
('B007', 'Loyalty Points Boost', 'Double loyalty points for a week', 'LoyaltyPoints', 0.00, 100.00, NULL, 0, '2025-04-10 00:00:00', '2025-05-10 23:59:59', TRUE, FALSE, NULL, 'Regular', NULL, JSON_ARRAY('Regular', 'VIP')),
('B008', 'Refer a Friend', 'Bonus for referring new players', 'ReferralBonus', 50.00, NULL, NULL, 20, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, TRUE, NULL, 'Regular', NULL, JSON_ARRAY('Regular', 'VIP', 'Casual')),
('B009', 'Tournament Prize', 'Prize for slot tournament winners', 'TournamentPrize', 1000.00, NULL, NULL, 15, '2025-05-01 00:00:00', '2025-05-31 23:59:59', FALSE, TRUE, NULL, 'Regular', JSON_ARRAY('G001', 'G004', 'G006', 'G010', 'G012', 'G014'), JSON_ARRAY('Regular', 'Casual', 'VIP')),
('B010', 'Re-activation Bonus', 'Bonus for dormant players', 'DepositMatch', 150.00, 150.00, 10.00, 25, '2025-04-01 00:00:00', '2025-07-31 23:59:59', TRUE, FALSE, NULL, 'Dormant', NULL, JSON_ARRAY('Dormant'));

-- Sample GameSessions data
INSERT INTO game_sessions (id, player_id, game_id, start_time, end_time, total_bets, total_wins, total_spins, total_hands, device_type, browser_info, applied_bonus_id, deposit_amount, withdrawal_amount) VALUES
('GS001', 'P001', 'G001', '2025-04-28 19:30:00', '2025-04-28 20:45:00', 250.00, 225.00, 125, 0, 'Desktop', 'Chrome/112.0', 'B002', 0.00, 0.00),
('GS002', 'P002', 'G004', '2025-04-28 14:15:00', '2025-04-28 15:30:00', 100.00, 135.00, 80, 0, 'Mobile', 'Safari/15.4', NULL, 50.00, 0.00),
('GS003', 'P003', 'G003', '2025-04-27 21:00:00', '2025-04-27 23:30:00', 5000.00, 4750.00, 0, 85, 'Desktop', 'Firefox/98.0', NULL, 1000.00, 0.00),
('GS004', 'P004', 'G006', '2025-04-15 11:00:00', '2025-04-15 11:45:00', 30.00, 20.00, 60, 0, 'Mobile', 'Chrome/110.0', 'B005', 0.00, 0.00),
('GS005', 'P005', 'G002', '2025-03-01 14:00:00', '2025-03-01 15:30:00', 1200.00, 1100.00, 0, 45, 'Desktop', 'Edge/100.0', NULL, 300.00, 200.00),
('GS006', 'P006', 'G010', '2025-04-28 22:00:00', '2025-04-28 23:15:00', 180.00, 210.00, 90, 0, 'Tablet', 'Safari/15.5', NULL, 100.00, 0.00),
('GS007', 'P007', 'G015', '2025-04-28 19:30:00', '2025-04-28 22:00:00', 3500.00, 4100.00, 0, 75, 'Desktop', 'Chrome/112.0', 'B004', 1000.00, 1500.00),
('GS008', 'P008', 'G001', '2025-04-28 17:30:00', '2025-04-28 18:15:00', 75.00, 60.00, 65, 0, 'Mobile', 'Chrome/111.0', 'B002', 50.00, 0.00),
('GS009', 'P009', 'G012', '2025-04-29 08:00:00', '2025-04-29 09:30:00', 400.00, 375.00, 160, 0, 'Desktop', 'Firefox/99.0', NULL, 200.00, 0.00),
('GS010', 'P010', 'G007', '2025-03-15 12:00:00', '2025-03-15 13:30:00', 100.00, 85.00, 0, 0, 'Tablet', 'Safari/15.4', NULL, 50.00, 0.00),
('GS011', 'P001', 'G002', '2025-04-25 14:00:00', '2025-04-25 15:30:00', 300.00, 275.00, 0, 40, 'Desktop', 'Chrome/112.0', NULL, 0.00, 0.00),
('GS012', 'P003', 'G004', '2025-04-26 18:15:00', '2025-04-26 19:30:00', 1200.00, 980.00, 150, 0, 'Mobile', 'Chrome/112.0', NULL, 500.00, 0.00),
('GS013', 'P006', 'G001', '2025-04-26 21:30:00', '2025-04-26 22:45:00', 150.00, 180.00, 95, 0, 'Desktop', 'Firefox/99.0', NULL, 0.00, 0.00),
('GS014', 'P007', 'G003', '2025-04-27 15:00:00', '2025-04-27 17:30:00', 2500.00, 2800.00, 0, 65, 'Desktop', 'Chrome/112.0', NULL, 0.00, 1000.00),
('GS015', 'P009', 'G010', '2025-04-28 20:15:00', '2025-04-28 21:30:00', 350.00, 310.00, 120, 0, 'Mobile', 'Safari/15.5', NULL, 0.00, 0.00),
('GS016', 'P002', 'G002', '2025-04-29 09:00:00', '2025-04-29 10:15:00', 125.00, 140.00, 0, 25, 'Desktop', 'Chrome/112.0', NULL, 0.00, 0.00),
('GS017', 'P003', 'G015', '2025-04-28 14:30:00', '2025-04-28 16:45:00', 3800.00, 4050.00, 0, 70, 'Desktop', 'Firefox/99.0', 'B004', 0.00, 0.00),
('GS018', 'P008', 'G006', '2025-04-27 13:15:00', '2025-04-27 14:00:00', 60.00, 45.00, 75, 0, 'Mobile', 'Chrome/111.0', NULL, 0.00, 0.00),
('GS019', 'P001', 'G004', '2025-04-27 10:30:00', '2025-04-27 11:45:00', 200.00, 240.00, 110, 0, 'Desktop', 'Chrome/112.0', NULL, 0.00, 0.00),
('GS020', 'P009', 'G002', '2025-04-26 19:00:00', '2025-04-26 20:30:00', 450.00, 420.00, 0, 55, 'Desktop', 'Edge/100.0', NULL, 0.00, 0.00);

-- Sample BonusClaims data
INSERT INTO bonus_claims (id, player_id, bonus_id, claim_date, claimed_date, status, deposit_amount, completion_date, wagering_progress, expiry_date, conversion_trigger, bonus_value, bonus_type) VALUES
('BC001', 'P004', 'B001', '2025-03-10 11:30:00', '2025-03-10 11:30:00', 'Active', 50.00, NULL, 45.50, '2025-04-10 11:30:00', 'signup', 50.00, 'DepositMatch'),
('BC002', 'P001', 'B002', '2025-04-15 19:00:00', '2025-04-15 19:00:00', 'Active', NULL, NULL, 60.00, '2025-04-29 19:00:00', 'email', 25.00, 'FreeSpins'),
('BC003', 'P003', 'B004', '2025-04-10 14:15:00', '2025-04-10 14:15:00', 'Completed', 500.00, '2025-04-20 10:30:00', 100.00, '2025-05-10 14:15:00', 'vip_offer', 250.00, 'DepositMatch'),
('BC004', 'P005', 'B003', '2025-03-01 12:00:00', '2025-03-01 12:00:00', 'Completed', NULL, '2025-03-05 18:45:00', 100.00, '2025-04-01 12:00:00', 'weekend_promo', 120.00, 'Cashback'),
('BC005', 'P004', 'B005', '2025-04-14 10:30:00', '2025-04-14 10:30:00', 'Active', NULL, NULL, 30.00, '2025-04-28 10:30:00', 'app_install', 10.00, 'NoDeposit'),
('BC006', 'P006', 'B006', '2025-04-20 22:15:00', '2025-04-20 22:15:00', 'Active', 100.00, NULL, 75.00, '2025-05-20 22:15:00', 'sms', 50.00, 'Reload'),
('BC007', 'P007', 'B004', '2025-04-12 19:30:00', '2025-04-12 19:30:00', 'Active', 1000.00, NULL, 90.00, '2025-05-12 19:30:00', 'vip_offer', 500.00, 'DepositMatch'),
('BC008', 'P008', 'B002', '2025-04-25 17:45:00', '2025-04-25 17:45:00', 'Active', NULL, NULL, 25.00, '2025-05-09 17:45:00', 'notification', 25.00, 'FreeSpins'),
('BC009', 'P009', 'B003', '2025-04-22 21:00:00', '2025-04-22 21:00:00', 'Active', NULL, NULL, 0.00, '2025-05-22 21:00:00', 'weekend_promo', 75.00, 'Cashback'),
('BC010', 'P010', 'B010', '2025-03-15 12:20:00', '2025-03-15 12:20:00', 'Failed', 20.00, NULL, 15.00, '2025-04-15 12:20:00', 'reactivation', 30.00, 'DepositMatch'),
('BC011', 'P001', 'B006', '2025-04-20 18:30:00', '2025-04-20 18:30:00', 'Active', 200.00, NULL, 80.00, '2025-05-20 18:30:00', 'banner', 100.00, 'Reload'),
('BC012', 'P003', 'B007', '2025-04-15 14:45:00', '2025-04-15 14:45:00', 'Completed', NULL, '2025-04-22 16:30:00', 100.00, '2025-04-22 14:45:00', 'loyalty', 0.00, 'LoyaltyPoints'),
('BC013', 'P007', 'B008', '2025-04-05 11:15:00', '2025-04-05 11:15:00', 'Completed', NULL, '2025-04-15 09:30:00', 100.00, '2025-05-05 11:15:00', 'referral', 50.00, 'ReferralBonus'),
('BC014', 'P008', 'B006', '2025-04-26 10:45:00', '2025-04-26 10:45:00', 'Active', 50.00, NULL, 40.00, '2025-05-26 10:45:00', 'email', 25.00, 'Reload'),
('BC015', 'P002', 'B002', '2025-04-10 15:30:00', '2025-04-10 15:30:00', 'Expired', NULL, NULL, 50.00, '2025-04-24 15:30:00', 'notification', 25.00, 'FreeSpins');

-- Sample PlayerFeatures data
INSERT INTO player_features (player_id, generated_date, timestamp_utc, country, days_since_registration, age, gender, favorite_game_type, top_played_game_ids, average_bet_size, average_session_length_minutes, session_frequency_per_week, preferred_time_slots, preferred_device, sessions_per_week, average_session_duration, days_active_30, days_active_90, favorite_game_category, preferred_session_time, preferred_game_genre, session_frequency, preferred_playing_time_of_day, last_active, total_deposits_last_30_days, total_withdrawals_last_30_days, average_deposit_amount, deposit_frequency_per_month, lifetime_value, monthly_average_deposit, typical_deposit_amount, bonus_usage_rate, preferred_bonus_type, bonus_to_deposit_conversion_rate, wagering_completion_rate, bonus_preference, total_bonuses_claimed, referred_others, total_referrals, risk_score, churn_probability, risk_level, retention_score, churn_risk, upsell_potential, player_lifetime_value, current_segment) VALUES
('P001', '2025-04-28 23:00:00', '2025-04-28 23:00:00', 'USA', 714, 34, 'Male', 'Slot', JSON_ARRAY('G001', 'G004', 'G006'), 2.00, 75, 4, JSON_ARRAY('Evening', 'Night'), 'Desktop', 4.0, 75, 18, 65, 'Video', 'Evening', 'Adventure', 4.0, 'Evening', '2025-04-28 20:45:00', 500.00, 200.00, 100.00, 5, 4500.00, 500.00, 100.00, 0.75, 'FreeSpins', 0.80, 0.85, 'FreeSpins', 5, TRUE, 3, 0.15, 0.10, 'Low', 85, 0.10, 0.70, 4500.00, 'Regular'),
('P002', '2025-04-29 10:00:00', '2025-04-29 10:00:00', 'UK', 100, 29, 'Female', 'Table', JSON_ARRAY('G002', 'G004', 'G011'), 1.50, 60, 2, JSON_ARRAY('Morning', 'Afternoon'), 'Mobile', 2.0, 60, 12, 40, 'Classic', 'Morning', 'Card', 2.0, 'Morning', '2025-04-29 10:15:00', 300.00, 100.00, 75.00, 3, 1000.00, 250.00, 75.00, 0.50, 'FreeSpins', 0.60, 0.45, 'DepositMatch', 2, FALSE, 0, 0.30, 0.25, 'Medium', 65, 0.25, 0.40, 1000.00, 'Casual'),
('P003', '2025-04-28 23:00:00', '2025-04-28 23:00:00', 'Germany', 905, 41, 'Male', 'LiveDealer', JSON_ARRAY('G003', 'G015', 'G005'), 50.00, 150, 5, JSON_ARRAY('Evening', 'Night'), 'Desktop', 5.0, 150, 25, 80, 'VIP', 'Evening', 'Card', 5.0, 'Evening', '2025-04-28 16:45:00', 4000.00, 2500.00, 500.00, 8, 20000.00, 4000.00, 500.00, 0.90, 'DepositMatch', 0.95, 0.90, 'HighRoller', 10, TRUE, 8, 0.05, 0.05, 'Very Low', 95, 0.05, 0.90, 20000.00, 'VIP'),
('P004', '2025-04-15 12:00:00', '2025-04-15 12:00:00', 'Spain', 50, 26, 'Female', 'Slot', JSON_ARRAY('G001', 'G006'), 0.50, 45, 1, JSON_ARRAY('Morning'), 'Mobile', 1.0, 45, 5, 15, 'Video', 'Morning', 'Adventure', 1.0, 'Morning', '2025-04-15 11:45:00', 100.00, 50.00, 50.00, 2, 250.00, 100.00, 50.00, 0.80, 'NoDeposit', 0.40, 0.30, 'FreeSpins', 2, FALSE, 0, 0.40, 0.20, 'Medium', 60, 0.20, 0.30, 250.00, 'New'),
('P005', '2025-03-01 16:00:00', '2025-03-01 16:00:00', 'Canada', 251, 38, 'Male', 'Table', JSON_ARRAY('G002', 'G011', 'G013'), 25.00, 90, 2, JSON_ARRAY('Afternoon'), 'Desktop', 2.0, 90, 0, 5, 'Classic', 'Afternoon', 'Card', 2.0, 'Afternoon', '2025-03-01 15:30:00', 300.00, 200.00, 200.00, 1, 8000.00, 800.00, 200.00, 0.40, 'Cashback', 0.75, 0.80, 'Cashback', 4, FALSE, 0, 0.75, 0.80, 'High', 30, 0.80, 0.20, 8000.00, 'Dormant'),
('P006', '2025-04-28 23:30:00', '2025-04-28 23:30:00', 'Australia', 377, 33, 'Female', 'Slot', JSON_ARRAY('G001', 'G010', 'G006'), 2.00, 65, 3, JSON_ARRAY('Evening', 'Night'), 'Tablet', 3.0, 65, 20, 60, 'Video', 'Night', 'Fantasy', 3.0, 'Night', '2025-04-28 23:15:00', 400.00, 150.00, 125.00, 4, 3500.00, 350.00, 125.00, 0.70, 'Reload', 0.75, 0.70, 'Reload', 3, TRUE, 1, 0.20, 0.15, 'Low', 80, 0.15, 0.60, 3500.00, 'Regular'),
('P007', '2025-04-29 00:00:00', '2025-04-29 00:00:00', 'France', 871, 45, 'Male', 'LiveDealer', JSON_ARRAY('G003', 'G015', 'G002'), 45.00, 140, 4, JSON_ARRAY('Evening', 'Afternoon'), 'Desktop', 4.0, 140, 22, 75, 'VIP', 'Evening', 'Card', 4.0, 'Evening', '2025-04-29 10:05:00', 3000.00, 1500.00, 350.00, 7, 14000.00, 2500.00, 350.00, 0.85, 'DepositMatch', 0.90, 0.85, 'VIP', 8, TRUE, 5, 0.10, 0.08, 'Very Low', 90, 0.08, 0.85, 14000.00, 'VIP'),
('P008', '2025-04-28 18:30:00', '2025-04-28 18:30:00', 'Italy', 61, 31, 'Female', 'Slot', JSON_ARRAY('G001', 'G006', 'G004'), 1.25, 50, 3, JSON_ARRAY('Afternoon', 'Evening'), 'Mobile', 3.0, 50, 15, 30, 'Video', 'Evening', 'Adventure', 3.0, 'Evening', '2025-04-28 18:15:00', 250.00, 100.00, 65.00, 4, 850.00, 200.00, 65.00, 0.60, 'FreeSpins', 0.50, 0.40, 'FreeSpins', 3, FALSE, 0, 0.35, 0.30, 'Medium', 70, 0.30, 0.45, 850.00, 'Casual'),
('P009', '2025-04-29 09:00:00', '2025-04-29 09:00:00', 'USA', 206, 37, 'Male', 'Slot', JSON_ARRAY('G012', 'G010', 'G001'), 2.50, 85, 4, JSON_ARRAY('Morning', 'Evening'), 'Desktop', 4.0, 85, 21, 70, 'Progressive', 'Morning', 'Jackpot', 4.0, 'Morning', '2025-04-29 09:30:00', 600.00, 300.00, 180.00, 5, 6500.00, 600.00, 180.00, 0.65, 'Cashback', 0.70, 0.75, 'Cashback', 4, TRUE, 2, 0.15, 0.12, 'Low', 85, 0.12, 0.65, 6500.00, 'Regular'),
('P010', '2025-03-15 14:00:00', '2025-03-15 14:00:00', 'UK', 105, 28, 'Female', 'Bingo', JSON_ARRAY('G007', 'G008'), 1.00, 70, 1, JSON_ARRAY('Afternoon'), 'Tablet', 1.0, 70, 0, 8, 'New', 'Afternoon', 'Numbers', 1.0, 'Afternoon', '2025-03-15 13:30:00', 150.00, 100.00, 90.00, 2, 2000.00, 200.00, 90.00, 0.45, 'DepositMatch', 0.55, 0.40, 'Welcome', 3, FALSE, 0, 0.80, 0.75, 'High', 35, 0.75, 0.25, 2000.00, 'Dormant');

-- Sample Recommendations data
INSERT INTO recommendations (id, player_id, created_at, valid_until, is_displayed, is_clicked, is_accepted, displayed_at, clicked_at, accepted_at, is_viewed, is_played, recommended_games, recommended_bonus) VALUES
('R001', 'P001', '2025-04-28 23:00:00', '2025-05-05 23:00:00', TRUE, TRUE, TRUE, '2025-04-29 08:15:00', '2025-04-29 08:16:00', '2025-04-29 08:20:00', TRUE, TRUE, 
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G004', 'GameName', 'Mega Gems', 'Score', 0.92, 'RecommendationReason', 'Matches your playing style'),
        JSON_OBJECT('GameId', 'G010', 'GameName', 'Mystic Fortune', 'Score', 0.85, 'RecommendationReason', 'Based on your interest in Slot games'),
        JSON_OBJECT('GameId', 'G012', 'GameName', 'Mega Jackpot Slots', 'Score', 0.78, 'RecommendationReason', 'Popular among players like you'),
        JSON_OBJECT('GameId', 'G006', 'GameName', 'Treasure Island', 'Score', 0.75, 'RecommendationReason', 'Similar to games you enjoy'),
        JSON_OBJECT('GameId', 'G014', 'GameName', 'Space Adventure', 'Score', 0.70, 'RecommendationReason', 'New release you might enjoy')
    ),
    JSON_OBJECT('BonusId', 'B006', 'BonusName', 'Reload Bonus', 'BonusType', 'Reload', 'Amount', 200.00, 'PercentageMatch', 50.00, 'Score', 0.88, 'RecommendationReason', 'Matched to your deposit patterns')
),
('R002', 'P002', '2025-04-29 10:00:00', '2025-05-06 10:00:00', TRUE, FALSE, FALSE, '2025-04-29 10:10:00', NULL, NULL, TRUE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G011', 'GameName', 'European Roulette', 'Score', 0.91, 'RecommendationReason', 'Based on your interest in Table games'),
        JSON_OBJECT('GameId', 'G002', 'GameName', 'Royal Blackjack', 'Score', 0.87, 'RecommendationReason', 'Matches your playing style'),
        JSON_OBJECT('GameId', 'G013', 'GameName', 'Caribbean Poker', 'Score', 0.76, 'RecommendationReason', 'Popular among Table game players'),
        JSON_OBJECT('GameId', 'G003', 'GameName', 'Live Roulette Pro', 'Score', 0.72, 'RecommendationReason', 'Upgrade from your current games'),
        JSON_OBJECT('GameId', 'G004', 'GameName', 'Mega Gems', 'Score', 0.65, 'RecommendationReason', 'Different game type you might enjoy')
    ),
    JSON_OBJECT('BonusId', 'B002', 'BonusName', 'Free Spins Pack', 'BonusType', 'FreeSpins', 'Amount', 50.00, 'PercentageMatch', NULL, 'Score', 0.76, 'RecommendationReason', 'Try out some exciting slot games on us')
),
('R003', 'P003', '2025-04-28 23:00:00', '2025-05-05 23:00:00', TRUE, TRUE, TRUE, '2025-04-29 09:45:00', '2025-04-29 09:46:00', '2025-04-29 10:00:00', TRUE, TRUE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G015', 'GameName', 'Live Baccarat', 'Score', 0.95, 'RecommendationReason', 'Based on your interest in LiveDealer games'),
        JSON_OBJECT('GameId', 'G003', 'GameName', 'Live Roulette Pro', 'Score', 0.92, 'RecommendationReason', 'Matches your VIP playing style'),
        JSON_OBJECT('GameId', 'G005', 'GameName', 'Texas Hold''em', 'Score', 0.85, 'RecommendationReason', 'Popular among VIP players like you'),
        JSON_OBJECT('GameId', 'G013', 'GameName', 'Caribbean Poker', 'Score', 0.77, 'RecommendationReason', 'Expands your card game portfolio'),
        JSON_OBJECT('GameId', 'G002', 'GameName', 'Royal Blackjack', 'Score', 0.75, 'RecommendationReason', 'Classic table game for VIP players')
    ),
    JSON_OBJECT('BonusId', 'B004', 'BonusName', 'VIP Bonus', 'BonusType', 'DepositMatch', 'Amount', 1000.00, 'PercentageMatch', 50.00, 'Score', 0.95, 'RecommendationReason', 'Exclusive high-value bonus for your VIP status')
),
('R004', 'P004', '2025-04-15 12:00:00', '2025-04-22 12:00:00', TRUE, TRUE, FALSE, '2025-04-15 14:30:00', '2025-04-15 14:31:00', NULL, TRUE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G001', 'GameName', 'Fortune Spins', 'Score', 0.88, 'RecommendationReason', 'Perfect for new slot players'),
        JSON_OBJECT('GameId', 'G006', 'GameName', 'Treasure Island', 'Score', 0.82, 'RecommendationReason', 'Adventure slots with exciting features'),
        JSON_OBJECT('GameId', 'G010', 'GameName', 'Mystic Fortune', 'Score', 0.75, 'RecommendationReason', 'Popular among new players'),
        JSON_OBJECT('GameId', 'G004', 'GameName', 'Mega Gems', 'Score', 0.68, 'RecommendationReason', 'Chance to win progressive jackpots'),
        JSON_OBJECT('GameId', 'G014', 'GameName', 'Space Adventure', 'Score', 0.64, 'RecommendationReason', 'New release with great graphics')
    ),
    JSON_OBJECT('BonusId', 'B001', 'BonusName', 'Welcome Bonus', 'BonusType', 'DepositMatch', 'Amount', 100.00, 'PercentageMatch', 100.00, 'Score', 0.90, 'RecommendationReason', 'Perfect welcome bonus to boost your balance')
),
('R005', 'P006', '2025-04-28 23:30:00', '2025-05-05 23:30:00', TRUE, FALSE, FALSE, '2025-04-29 09:15:00', NULL, NULL, TRUE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G010', 'GameName', 'Mystic Fortune', 'Score', 0.89, 'RecommendationReason', 'Matches your fantasy theme preference'),
        JSON_OBJECT('GameId', 'G004', 'GameName', 'Mega Gems', 'Score', 0.83, 'RecommendationReason', 'Popular among slot players like you'),
        JSON_OBJECT('GameId', 'G014', 'GameName', 'Space Adventure', 'Score', 0.78, 'RecommendationReason', 'New release you might enjoy'),
        JSON_OBJECT('GameId', 'G001', 'GameName', 'Fortune Spins', 'Score', 0.75, 'RecommendationReason', 'Based on your recent gaming activity'),
        JSON_OBJECT('GameId', 'G012', 'GameName', 'Mega Jackpot Slots', 'Score', 0.72, 'RecommendationReason', 'Big win potential matches your play style')
    ),
    JSON_OBJECT('BonusId', 'B006', 'BonusName', 'Reload Bonus', 'BonusType', 'Reload', 'Amount', 200.00, 'PercentageMatch', 50.00, 'Score', 0.85, 'RecommendationReason', 'Great way to boost your next deposit')
),
('R006', 'P007', '2025-04-29 00:00:00', '2025-05-06 00:00:00', TRUE, TRUE, FALSE, '2025-04-29 10:05:00', '2025-04-29 10:07:00', NULL, TRUE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G015', 'GameName', 'Live Baccarat', 'Score', 0.93, 'RecommendationReason', 'Premium VIP live dealer experience'),
        JSON_OBJECT('GameId', 'G003', 'GameName', 'Live Roulette Pro', 'Score', 0.91, 'RecommendationReason', 'Matches your high-stakes play style'),
        JSON_OBJECT('GameId', 'G002', 'GameName', 'Royal Blackjack', 'Score', 0.84, 'RecommendationReason', 'VIP blackjack tables available'),
        JSON_OBJECT('GameId', 'G013', 'GameName', 'Caribbean Poker', 'Score', 0.79, 'RecommendationReason', 'High-value poker variant for VIPs'),
        JSON_OBJECT('GameId', 'G005', 'GameName', 'Texas Hold''em', 'Score', 0.76, 'RecommendationReason', 'Poker tournaments with high stakes')
    ),
    JSON_OBJECT('BonusId', 'B007', 'BonusName', 'Loyalty Points Boost', 'BonusType', 'LoyaltyPoints', 'Amount', 0.00, 'PercentageMatch', 100.00, 'Score', 0.92, 'RecommendationReason', 'Double your loyalty points earnings this week')
),
('R007', 'P008', '2025-04-28 18:30:00', '2025-05-05 18:30:00', FALSE, FALSE, FALSE, NULL, NULL, NULL, FALSE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G001', 'GameName', 'Fortune Spins', 'Score', 0.90, 'RecommendationReason', 'Consistent with your slot preferences'),
        JSON_OBJECT('GameId', 'G006', 'GameName', 'Treasure Island', 'Score', 0.85, 'RecommendationReason', 'Adventure theme similar to your favorites'),
        JSON_OBJECT('GameId', 'G004', 'GameName', 'Mega Gems', 'Score', 0.78, 'RecommendationReason', 'Progressive jackpot opportunity'),
        JSON_OBJECT('GameId', 'G010', 'GameName', 'Mystic Fortune', 'Score', 0.75, 'RecommendationReason', 'Similar gameplay to your preferences'),
        JSON_OBJECT('GameId', 'G014', 'GameName', 'Space Adventure', 'Score', 0.67, 'RecommendationReason', 'New release with great features')
    ),
    JSON_OBJECT('BonusId', 'B002', 'BonusName', 'Free Spins Pack', 'BonusType', 'FreeSpins', 'Amount', 50.00, 'PercentageMatch', NULL, 'Score', 0.87, 'RecommendationReason', 'Matched to your love of slot games')
),
('R008', 'P009', '2025-04-29 09:00:00', '2025-05-06 09:00:00', TRUE, FALSE, FALSE, '2025-04-29 09:05:00', NULL, NULL, TRUE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G012', 'GameName', 'Mega Jackpot Slots', 'Score', 0.94, 'RecommendationReason', 'Perfect match for your jackpot interest'),
        JSON_OBJECT('GameId', 'G004', 'GameName', 'Mega Gems', 'Score', 0.87, 'RecommendationReason', 'Another jackpot game you might enjoy'),
        JSON_OBJECT('GameId', 'G010', 'GameName', 'Mystic Fortune', 'Score', 0.82, 'RecommendationReason', 'Based on your recent gaming activity'),
        JSON_OBJECT('GameId', 'G014', 'GameName', 'Space Adventure', 'Score', 0.78, 'RecommendationReason', 'New release with exciting features'),
        JSON_OBJECT('GameId', 'G001', 'GameName', 'Fortune Spins', 'Score', 0.75, 'RecommendationReason', 'Popular slot among similar players')
    ),
    JSON_OBJECT('BonusId', 'B003', 'BonusName', 'Weekend Cashback', 'BonusType', 'Cashback', 'Amount', 500.00, 'PercentageMatch', 10.00, 'Score', 0.89, 'RecommendationReason', 'Protection for your weekend gameplay')
),
('R009', 'P010', '2025-03-15 14:00:00', '2025-03-22 14:00:00', FALSE, FALSE, FALSE, NULL, NULL, NULL, FALSE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G007', 'GameName', 'Lucky Bingo', 'Score', 0.92, 'RecommendationReason', 'Perfect match for your bingo preference'),
        JSON_OBJECT('GameId', 'G008', 'GameName', 'Golden Scratch', 'Score', 0.80, 'RecommendationReason', 'Quick games similar to your style'),
        JSON_OBJECT('GameId', 'G009', 'GameName', 'Virtual Derby', 'Score', 0.75, 'RecommendationReason', 'Different game type you might enjoy'),
        JSON_OBJECT('GameId', 'G001', 'GameName', 'Fortune Spins', 'Score', 0.70, 'RecommendationReason', 'Most popular game on our platform'),
        JSON_OBJECT('GameId', 'G006', 'GameName', 'Treasure Island', 'Score', 0.68, 'RecommendationReason', 'Easy gameplay for casual players')
    ),
    JSON_OBJECT('BonusId', 'B010', 'BonusName', 'Re-activation Bonus', 'BonusType', 'DepositMatch', 'Amount', 150.00, 'PercentageMatch', 150.00, 'Score', 0.95, 'RecommendationReason', 'Welcome back with this special deposit match')
),
('R010', 'P005', '2025-03-01 16:00:00', '2025-03-08 16:00:00', TRUE, FALSE, FALSE, '2025-03-01 18:30:00', NULL, NULL, TRUE, FALSE,
    JSON_ARRAY(
        JSON_OBJECT('GameId', 'G002', 'GameName', 'Royal Blackjack', 'Score', 0.93, 'RecommendationReason', 'Perfectly matches your table game preference'),
        JSON_OBJECT('GameId', 'G011', 'GameName', 'European Roulette', 'Score', 0.89, 'RecommendationReason', 'Classic table game you would enjoy'),
        JSON_OBJECT('GameId', 'G013', 'GameName', 'Caribbean Poker', 'Score', 0.83, 'RecommendationReason', 'Expand your card game experience'),
        JSON_OBJECT('GameId', 'G003', 'GameName', 'Live Roulette Pro', 'Score', 0.78, 'RecommendationReason', 'Live dealer version of your favorite games'),
        JSON_OBJECT('GameId', 'G015', 'GameName', 'Live Baccarat', 'Score', 0.75, 'RecommendationReason', 'Another live table game for your collection')
    ),
    JSON_OBJECT('BonusId', 'B010', 'BonusName', 'Re-activation Bonus', 'BonusType', 'DepositMatch', 'Amount', 150.00, 'PercentageMatch', 150.00, 'Score', 0.92, 'RecommendationReason', 'Welcome back with this special bonus')
);