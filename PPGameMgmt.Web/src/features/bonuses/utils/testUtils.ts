import { Bonus, BonusClaim } from '../types';

/**
 * Creates a mock bonus for testing purposes
 * @param overrides Optional properties to override in the mock bonus
 * @returns A mock bonus object
 */
export const createMockBonus = (overrides?: Partial<Bonus>): Bonus => {
  return {
    id: 1,
    name: 'Welcome Bonus',
    description: 'Get a bonus on your first deposit',
    value: 100,
    valueType: 'percentage',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
    isActive: true,
    targetSegment: 'new_players',
    conditions: ['First deposit only', 'Minimum deposit $10'],
    maxClaims: 1000,
    currentClaims: 320,
    minDepositAmount: 10,
    maxWinAmount: 500,
    wageringRequirement: 10,
    ...overrides
  };
};

/**
 * Creates an array of mock bonuses for testing purposes
 * @param count Number of mock bonuses to create
 * @returns Array of mock bonus objects
 */
export const createMockBonuses = (count: number): Bonus[] => {
  const valueTypes: Bonus['valueType'][] = ['percentage', 'fixed', 'free_spins'];
  const segments = ['new_players', 'vip', 'inactive', null];
  
  return Array.from({ length: count }, (_, index) => 
    createMockBonus({
      id: index + 1,
      name: `Bonus ${index + 1}`,
      valueType: valueTypes[index % valueTypes.length],
      value: valueTypes[index % valueTypes.length] === 'free_spins' ? 
        (index + 1) * 5 : // Free spins in increments of 5
        (index + 1) * 25, // Percentage or fixed amount
      targetSegment: segments[index % segments.length],
      isActive: index % 4 !== 0, // Make every 4th bonus inactive
      currentClaims: Math.floor(Math.random() * 500),
      startDate: new Date(Date.now() - (index * 2) * 24 * 60 * 60 * 1000).toISOString(), // Staggered start dates
      endDate: new Date(Date.now() + (30 - index) * 24 * 60 * 60 * 1000).toISOString() // Staggered end dates
    })
  );
};

/**
 * Creates a mock bonus claim for testing purposes
 * @param overrides Optional properties to override in the mock claim
 * @returns A mock bonus claim object
 */
export const createMockBonusClaim = (overrides?: Partial<BonusClaim>): BonusClaim => {
  return {
    id: 1,
    bonusId: 1,
    bonusName: 'Welcome Bonus',
    playerId: 1,
    playerName: 'John Doe',
    claimDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
    value: 50,
    status: 'active',
    wageringCompleted: 2.5,
    wageringRequired: 10,
    ...overrides
  };
};

/**
 * Creates an array of mock bonus claims for testing purposes
 * @param count Number of mock claims to create
 * @returns Array of mock bonus claim objects
 */
export const createMockBonusClaims = (count: number): BonusClaim[] => {
  const statuses: BonusClaim['status'][] = ['pending', 'active', 'completed', 'expired', 'canceled'];
  
  return Array.from({ length: count }, (_, index) => 
    createMockBonusClaim({
      id: index + 1,
      bonusId: (index % 5) + 1,
      bonusName: `Bonus ${(index % 5) + 1}`,
      playerId: (index % 10) + 1,
      playerName: `Player ${(index % 10) + 1}`,
      claimDate: new Date(Date.now() - index * 12 * 60 * 60 * 1000).toISOString(), // Staggered claim dates
      status: statuses[index % statuses.length],
      value: (index + 1) * 10,
      wageringCompleted: index % statuses.length === 2 ? 10 : index % 10, // Completed wagering for "completed" status
      wageringRequired: 10
    })
  );
};