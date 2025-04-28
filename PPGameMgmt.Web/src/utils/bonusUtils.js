/**
 * Utility functions for working with bonus data
 */

/**
 * Formats a date string to a localized date format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date or 'N/A' if no date provided
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

/**
 * Checks if a bonus is expired
 * @param {object} bonus - The bonus object to check
 * @returns {boolean} True if the bonus is expired
 */
export function isExpired(bonus) {
  if (!bonus.endDate) return false;
  return new Date(bonus.endDate) < new Date();
}

/**
 * Checks if a bonus is currently active
 * @param {object} bonus - The bonus object to check
 * @returns {boolean} True if the bonus is active
 */
export function isActive(bonus) {
  const now = new Date();
  const startDate = bonus.startDate ? new Date(bonus.startDate) : null;
  const endDate = bonus.endDate ? new Date(bonus.endDate) : null;
  
  return (!startDate || startDate <= now) && (!endDate || endDate >= now);
}

/**
 * Gets the status text for a bonus
 * @param {object} bonus - The bonus object
 * @returns {string} Status text ('Expired', 'Active', or 'Scheduled')
 */
export function getBonusStatus(bonus) {
  if (isExpired(bonus)) return 'Expired';
  if (isActive(bonus)) return 'Active';
  return 'Scheduled';
}

/**
 * Gets the CSS class for styling a bonus based on its status
 * @param {object} bonus - The bonus object
 * @returns {string} CSS class name
 */
export function getBonusStatusClass(bonus) {
  if (isExpired(bonus)) return 'expired';
  if (isActive(bonus)) return 'active';
  return 'scheduled';
}