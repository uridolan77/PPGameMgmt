export interface Player {
  id: number | string;
  username: string;
  email: string;
  playerLevel?: number;
  segment?: string | number | null;
  lastLogin?: string | null;
  isActive?: boolean;
  registrationDate?: string | null;
  firstName?: string;
  lastName?: string;
  country?: string;
  birthDate?: string | null;
  notes?: string;
  balance?: number;

  // Alternative field names for compatibility with different API responses
  name?: string;
  displayName?: string;
  level?: number;
  createdAt?: string;
  created?: string;
  joinDate?: string;
  status?: string | boolean;
  active?: boolean;
  lastLoginDate?: string;
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