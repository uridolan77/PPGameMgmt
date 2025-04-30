import { Bonus, BonusFilter, BonusClaim, BonusClaimFilter } from '../types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatting';

/**
 * Format the display value of a bonus based on its type
 * @param bonus Bonus to format value for
 * @returns Formatted value string
 */
export const formatBonusValue = (bonus: Bonus): string => {
  switch (bonus.valueType) {
    case 'percentage':
      return `${bonus.value}%`;
    case 'fixed':
      return formatCurrency(bonus.value);
    case 'free_spins':
      return `${bonus.value} Free Spins`;
    default:
      return `${bonus.value}`;
  }
};

/**
 * Check if a bonus is active based on current date and active state
 * @param bonus Bonus to check
 * @returns Whether the bonus is currently active
 */
export const isBonusActive = (bonus: Bonus): boolean => {
  if (!bonus.isActive) return false;
  
  const now = new Date();
  const startDate = new Date(bonus.startDate);
  const endDate = new Date(bonus.endDate);
  
  return now >= startDate && now <= endDate;
};

/**
 * Format the active status of a bonus for display
 * @param bonus Bonus to format status for
 * @returns Formatted status string and class name for styling
 */
export const getBonusStatus = (bonus: Bonus): { text: string; className: string } => {
  if (!bonus.isActive) {
    return { text: 'Inactive', className: 'text-gray-500' };
  }
  
  const now = new Date();
  const startDate = new Date(bonus.startDate);
  const endDate = new Date(bonus.endDate);
  
  if (now < startDate) {
    return { text: 'Scheduled', className: 'text-blue-500' };
  } else if (now > endDate) {
    return { text: 'Expired', className: 'text-red-500' };
  } else {
    return { text: 'Active', className: 'text-green-500' };
  }
};

/**
 * Calculate the usage percentage of a bonus
 * @param bonus Bonus to calculate usage for
 * @returns Usage percentage (0-100)
 */
export const getBonusUsagePercentage = (bonus: Bonus): number => {
  if (!bonus.maxClaims) return 0;
  return Math.min(100, (bonus.currentClaims / bonus.maxClaims) * 100);
};

/**
 * Format a bonus claim's status with appropriate styling
 * @param status Claim status
 * @returns Status info with display text and styling class
 */
export const formatBonusClaimStatus = (status: string): { text: string; className: string } => {
  switch (status) {
    case 'pending':
      return { text: 'Pending', className: 'text-yellow-500' };
    case 'active':
      return { text: 'Active', className: 'text-green-500' };
    case 'completed':
      return { text: 'Completed', className: 'text-blue-500' };
    case 'expired':
      return { text: 'Expired', className: 'text-red-500' };
    case 'canceled':
      return { text: 'Canceled', className: 'text-gray-500' };
    default:
      return { text: status, className: 'text-gray-500' };
  }
};

/**
 * Apply filters to a list of bonuses
 * @param bonuses List of bonuses to filter
 * @param filters Filter criteria
 * @returns Filtered list of bonuses
 */
export const applyBonusFilters = (bonuses: Bonus[], filters: BonusFilter): Bonus[] => {
  return bonuses.filter(bonus => {
    // Filter by search term
    if (filters.searchTerm && 
        !bonus.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !bonus.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by active status
    if (filters.isActive !== undefined && bonus.isActive !== filters.isActive) {
      return false;
    }
    
    // Filter by start date range
    if (filters.startDateFrom && new Date(bonus.startDate) < new Date(filters.startDateFrom)) {
      return false;
    }
    if (filters.startDateTo && new Date(bonus.startDate) > new Date(filters.startDateTo)) {
      return false;
    }
    
    // Filter by end date range
    if (filters.endDateFrom && new Date(bonus.endDate) < new Date(filters.endDateFrom)) {
      return false;
    }
    if (filters.endDateTo && new Date(bonus.endDate) > new Date(filters.endDateTo)) {
      return false;
    }
    
    // Filter by target segment
    if (filters.targetSegment && bonus.targetSegment !== filters.targetSegment) {
      return false;
    }
    
    // Filter by value type
    if (filters.valueType && bonus.valueType !== filters.valueType) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    const sortField = filters.sortBy || 'name';
    const direction = filters.sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'name') {
      return direction * a.name.localeCompare(b.name);
    } else if (sortField === 'startDate') {
      return direction * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (sortField === 'endDate') {
      return direction * (new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    } else if (sortField === 'value') {
      return direction * (a.value - b.value);
    } else if (sortField === 'currentClaims') {
      return direction * (a.currentClaims - b.currentClaims);
    }
    
    return 0;
  });
};