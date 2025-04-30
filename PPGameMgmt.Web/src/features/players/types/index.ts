export interface Player {
  id: number;
  username: string;
  email: string;
  playerLevel: number;
  segment: string | null;
  lastLogin: string | null;
  isActive: boolean;
}

export interface PlayerFeature {
  id: number;
  name: string;
  isEnabled: boolean;
  settings?: Record<string, any>;
  playerId?: number;
}

export interface GameSession {
  id: number;
  gameName: string;
  startTime: string;
  duration: number; // in seconds
  betAmount: number;
  winAmount: number;
  playerId?: number;
  gameId?: number;
}

export interface BonusClaim {
  id: number;
  bonusName: string;
  claimDate: string;
  value: number;
  status: string;
  playerId?: number;
  bonusId?: number;
  expiryDate?: string;
}

export type PlayerTabType = 'overview' | 'games' | 'bonuses' | 'features';