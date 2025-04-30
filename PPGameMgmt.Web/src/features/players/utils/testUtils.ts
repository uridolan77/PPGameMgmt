import { Player, PlayerFeature, GameSession, BonusClaim } from '../types';
import { PLAYER_SEGMENTS } from './constants';

/**
 * Creates a mock player for testing
 * @param overrides Optional properties to override in the mock player
 * @returns A mock player object
 */
export const createMockPlayer = (overrides?: Partial<Player>): Player => {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    playerLevel: 3,
    segment: PLAYER_SEGMENTS.STANDARD,
    lastLogin: new Date().toISOString(),
    isActive: true,
    ...overrides
  };
};

/**
 * Creates multiple mock players for testing
 * @param count Number of players to create
 * @returns Array of mock player objects
 */
export const createMockPlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockPlayer({
      id: index + 1,
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      playerLevel: Math.floor(Math.random() * 5) + 1,
      segment: index % 4 === 0 ? PLAYER_SEGMENTS.VIP : 
               index % 3 === 0 ? PLAYER_SEGMENTS.HIGH_ROLLER : 
               index % 2 === 0 ? PLAYER_SEGMENTS.STANDARD : PLAYER_SEGMENTS.NEW,
    })
  );
};

/**
 * Creates a mock player feature for testing
 * @param overrides Optional properties to override in the mock feature
 * @returns A mock player feature object
 */
export const createMockPlayerFeature = (overrides?: Partial<PlayerFeature>): PlayerFeature => {
  return {
    id: 1,
    name: 'Test Feature',
    isEnabled: true,
    playerId: 1,
    settings: {},
    ...overrides
  };
};

/**
 * Creates multiple mock features for a player
 * @param playerId ID of the player
 * @param count Number of features to create
 * @returns Array of mock player feature objects
 */
export const createMockPlayerFeatures = (playerId: number, count: number): PlayerFeature[] => {
  const features = [
    'Loyalty Rewards',
    'Free Spins',
    'Bonus Games',
    'VIP Access',
    'Daily Promotions',
    'Tournament Access',
    'Jackpot Participation',
    'Special Events'
  ];

  return Array.from({ length: count }, (_, index) => 
    createMockPlayerFeature({
      id: index + 1,
      name: features[index % features.length],
      isEnabled: index % 3 !== 0, // 2/3 of features are enabled
      playerId
    })
  );
};

/**
 * Creates a mock game session for testing
 * @param overrides Optional properties to override in the mock session
 * @returns A mock game session object
 */
export const createMockGameSession = (overrides?: Partial<GameSession>): GameSession => {
  return {
    id: 1,
    gameName: 'Test Game',
    startTime: new Date().toISOString(),
    duration: 300, // 5 minutes in seconds
    betAmount: 50,
    winAmount: 75,
    playerId: 1,
    gameId: 1,
    ...overrides
  };
};

/**
 * Creates multiple mock game sessions for a player
 * @param playerId ID of the player
 * @param count Number of sessions to create
 * @returns Array of mock game session objects
 */
export const createMockGameSessions = (playerId: number, count: number): GameSession[] => {
  const games = [
    'Stellar Spins',
    'Lucky Fortune',
    'Golden Dragon',
    'Mystic Gems',
    'Royal Flush',
    'Ancient Treasures',
    'Cosmic Wilds',
    'Diamond Deluxe'
  ];

  return Array.from({ length: count }, (_, index) => {
    // Create a date in the past
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
    
    const betAmount = Math.floor(Math.random() * 200) + 10;
    const winMultiplier = Math.random() * 2.5; // Sometimes win, sometimes lose
    
    return createMockGameSession({
      id: index + 1,
      gameName: games[index % games.length],
      startTime: date.toISOString(),
      duration: Math.floor(Math.random() * 1200) + 60, // 1-20 minutes in seconds
      betAmount,
      winAmount: Math.floor(betAmount * winMultiplier),
      playerId,
      gameId: index % games.length + 1
    });
  });
};

/**
 * Creates a mock bonus claim for testing
 * @param overrides Optional properties to override in the mock bonus
 * @returns A mock bonus claim object
 */
export const createMockBonusClaim = (overrides?: Partial<BonusClaim>): BonusClaim => {
  const claimDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // expires in 7 days
  
  return {
    id: 1,
    bonusName: 'Welcome Bonus',
    claimDate: claimDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    value: 100,
    status: 'Active',
    playerId: 1,
    bonusId: 1,
    ...overrides
  };
};

/**
 * Creates multiple mock bonus claims for a player
 * @param playerId ID of the player
 * @param count Number of bonuses to create
 * @returns Array of mock bonus claim objects
 */
export const createMockBonusClaims = (playerId: number, count: number): BonusClaim[] => {
  const bonuses = [
    'Welcome Bonus',
    'Loyalty Reward',
    'Weekly Cashback',
    'Birthday Bonus',
    'Refer-a-Friend Bonus',
    'VIP Exclusive',
    'Deposit Match',
    'Free Spins Bundle'
  ];
  
  const statuses = ['Active', 'Used', 'Expired'];
  
  return Array.from({ length: count }, (_, index) => {
    // Create dates accordingly
    const claimDate = new Date();
    claimDate.setDate(claimDate.getDate() - Math.floor(Math.random() * 30));
    
    const expiryDate = new Date(claimDate);
    expiryDate.setDate(claimDate.getDate() + 14); // All bonuses valid for 14 days
    
    const status = statuses[index % statuses.length];
    
    return createMockBonusClaim({
      id: index + 1,
      bonusName: bonuses[index % bonuses.length],
      claimDate: claimDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      value: Math.floor(Math.random() * 200) + 50,
      status,
      playerId,
      bonusId: index % bonuses.length + 1
    });
  });
};