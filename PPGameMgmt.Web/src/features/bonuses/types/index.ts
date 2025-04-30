/**
 * Bonus Campaign interface representing a promotional offer
 */
export interface Bonus {
  id: number;
  name: string;
  description: string;
  value: number;
  valueType: 'percentage' | 'fixed' | 'free_spins';
  startDate: string;
  endDate: string;
  isActive: boolean;
  targetSegment: string | null;
  conditions: string[];
  maxClaims: number | null;
  currentClaims: number;
  gameIds?: number[];
  minDepositAmount?: number;
  maxWinAmount?: number;
  wageringRequirement?: number;
  code?: string;
}

/**
 * Bonus claim transaction by a player
 */
export interface BonusClaim {
  id: number;
  bonusId: number;
  bonusName: string;
  playerId: number;
  playerName: string;
  claimDate: string;
  expiryDate: string | null;
  value: number;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'canceled';
  wageringCompleted?: number;
  wageringRequired?: number;
}

/**
 * Filter criteria for bonuses list
 */
export interface BonusFilter {
  isActive?: boolean;
  searchTerm?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  targetSegment?: string;
  valueType?: string;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'value' | 'currentClaims';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Filter criteria for bonus claims list
 */
export interface BonusClaimFilter {
  bonusId?: number;
  playerId?: number;
  status?: string;
  searchTerm?: string;
  claimDateFrom?: string;
  claimDateTo?: string;
  sortBy?: 'claimDate' | 'expiryDate' | 'value' | 'status';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Statistics about a bonus campaign performance
 */
export interface BonusStats {
  bonusId: number;
  totalClaims: number;
  uniquePlayers: number;
  averageWagering: number;
  conversionRate: number;
  totalValue: number;
}

/**
 * Input for creating/updating a bonus
 */
export type BonusInput = Omit<Bonus, 'id' | 'currentClaims'>;