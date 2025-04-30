import { Game, GameProvider } from '../types';

/**
 * Creates a mock game provider for testing purposes
 * @param overrides Optional properties to override in the mock provider
 * @returns A mock game provider object
 */
export const createMockGameProvider = (overrides?: Partial<GameProvider>): GameProvider => {
  return {
    id: 1,
    name: 'NetEnt',
    logoUrl: 'https://example.com/netent-logo.png',
    websiteUrl: 'https://www.netent.com',
    gameCount: 120,
    isActive: true,
    ...overrides
  };
};

/**
 * Creates a mock game for testing purposes
 * @param overrides Optional properties to override in the mock game
 * @returns A mock game object
 */
export const createMockGame = (overrides?: Partial<Game>): Game => {
  return {
    id: 1,
    name: 'Starburst',
    description: 'Classic slot game with expanding wilds and respins',
    imageUrl: 'https://example.com/starburst.jpg',
    type: 'slots',
    provider: createMockGameProvider(),
    releaseDate: '2022-01-15',
    rtp: 96.1,
    volatility: 'medium',
    minBet: 0.1,
    maxBet: 100,
    features: ['wilds', 'respins'],
    themes: ['space', 'gems'],
    isActive: true,
    isPromoted: false,
    rating: 4.5,
    playerCount: 750,
    ...overrides
  };
};

/**
 * Creates an array of mock games for testing purposes
 * @param count Number of mock games to create
 * @returns Array of mock game objects
 */
export const createMockGames = (count: number): Game[] => {
  const gameTypes = ['slots', 'table_games', 'live_dealer', 'video_poker', 'specialty', 'jackpot'];
  const volatilities = ['low', 'medium', 'high'];
  const themes = [
    ['egyptian', 'ancient'], 
    ['fantasy', 'magic'], 
    ['adventure', 'quest'], 
    ['fruits', 'classic'], 
    ['animals', 'wildlife'],
    ['space', 'gems'],
    ['mythology', 'gods'],
    ['movie', 'branded']
  ];
  const features = [
    ['wilds', 'respins'], 
    ['free_spins', 'multipliers'], 
    ['bonus_rounds', 'jackpot'], 
    ['cascading_reels', 'megaways'], 
    ['sticky_wilds', 'expanding_wilds']
  ];
  
  // Create a few providers to distribute among the games
  const providers = [
    createMockGameProvider({ id: 1, name: 'NetEnt', gameCount: 120 }),
    createMockGameProvider({ id: 2, name: 'Microgaming', gameCount: 150 }),
    createMockGameProvider({ id: 3, name: 'Playtech', gameCount: 100 }),
    createMockGameProvider({ id: 4, name: 'Evolution Gaming', gameCount: 80 }),
    createMockGameProvider({ id: 5, name: 'Pragmatic Play', gameCount: 130 })
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const isPromoted = index % 10 === 0; // Make every 10th game promoted
    const gameType = gameTypes[index % gameTypes.length];
    const provider = providers[index % providers.length];
    const releaseDate = new Date();
    
    // Stagger release dates over the past 3 years
    releaseDate.setMonth(releaseDate.getMonth() - (index * 2) % 36);
    
    return createMockGame({
      id: index + 1,
      name: `Game ${index + 1}`,
      type: gameType,
      provider,
      releaseDate: releaseDate.toISOString().split('T')[0],
      volatility: volatilities[index % volatilities.length],
      rtp: 92 + (index % 8), // RTP between 92 and 99
      isPromoted,
      isActive: index % 7 !== 0, // Make every 7th game inactive
      features: features[index % features.length],
      themes: themes[index % themes.length],
      playerCount: Math.floor(Math.random() * 1500),
      rating: (2.5 + (index % 5) * 0.5), // Rating between 2.5 and 5.0
      minBet: 0.1 * (1 + index % 5),
      maxBet: 50 * (1 + index % 4)
    });
  });
};