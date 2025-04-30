import { Player, GameSession, BonusClaim } from '../types';
import { formatCurrency } from '../../../shared/utils/formatting';

/**
 * Get player initials from name or username
 * @param player The player to get initials for
 * @returns Player initials (1-2 characters)
 */
export const getPlayerInitials = (player: Player): string => {
  if (!player) return '';
  
  if (player.firstName && player.lastName) {
    return `${player.firstName[0]}${player.lastName[0]}`.toUpperCase();
  }
  
  if (player.username) {
    return player.username.substring(0, 2).toUpperCase();
  }
  
  return '';
};

/**
 * Get the full name of a player
 * @param player The player to get the name for
 * @returns Full name or username if no name is available
 */
export const getPlayerFullName = (player: Player): string => {
  if (!player) return '';
  
  if (player.firstName && player.lastName) {
    return `${player.firstName} ${player.lastName}`;
  }
  
  return player.username;
};

/**
 * Calculate the total amount wagered by a player
 * @param gameSessions The player's game sessions
 * @returns Total amount wagered
 */
export const calculateTotalWagered = (gameSessions: GameSession[] = []): number => {
  if (!gameSessions || gameSessions.length === 0) return 0;
  
  return gameSessions.reduce((total, session) => total + (session.amountWagered || 0), 0);
};

/**
 * Calculate the total winnings of a player
 * @param gameSessions The player's game sessions
 * @returns Total winnings (can be negative)
 */
export const calculateTotalWinnings = (gameSessions: GameSession[] = []): number => {
  if (!gameSessions || gameSessions.length === 0) return 0;
  
  return gameSessions.reduce((total, session) => total + (session.amountWon || 0), 0);
};

/**
 * Calculate the net profit/loss of a player
 * @param gameSessions The player's game sessions
 * @returns Net profit/loss
 */
export const calculateNetProfitLoss = (gameSessions: GameSession[] = []): number => {
  if (!gameSessions || gameSessions.length === 0) return 0;
  
  return calculateTotalWinnings(gameSessions) - calculateTotalWagered(gameSessions);
};

/**
 * Format the net profit/loss with appropriate sign and color class
 * @param amount The amount to format
 * @returns Object with formatted amount and CSS class
 */
export const formatProfitLoss = (amount: number): { formatted: string; className: string } => {
  const formatted = formatCurrency(Math.abs(amount));
  
  if (amount > 0) {
    return {
      formatted: `+${formatted}`,
      className: 'text-green-600'
    };
  }
  
  if (amount < 0) {
    return {
      formatted: `-${formatted}`,
      className: 'text-red-600'
    };
  }
  
  return {
    formatted,
    className: 'text-gray-600'
  };
};

/**
 * Calculate the total value of bonuses claimed by a player
 * @param bonusClaims The player's bonus claims
 * @returns Total bonus value
 */
export const calculateTotalBonusValue = (bonusClaims: BonusClaim[] = []): number => {
  if (!bonusClaims || bonusClaims.length === 0) return 0;
  
  return bonusClaims.reduce((total, claim) => {
    // Only count completed claims
    if (claim.status === 'COMPLETED') {
      return total + (claim.bonusValue || 0);
    }
    return total;
  }, 0);
};
