/**
 * Mock service for generating activity data for development purposes
 */
import { subHours } from 'date-fns';

// Constants for activity generation
const GAMES = ['Mega Fortune', 'Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Dead or Alive'];
const BONUSES = ['Welcome Bonus', 'Free Spins', 'Reload Bonus', 'Cashback', 'VIP Bonus'];

/**
 * Generates random activity details based on the activity type
 * @param {string} type - The type of activity
 * @returns {string} Activity details text
 */
const getActivityDetails = (type) => {
  switch (type) {
    case 'login':
      return 'Logged in from web client';
    case 'game-play':
      return `Played ${GAMES[Math.floor(Math.random() * GAMES.length)]}`;
    case 'bonus-claim':
      return `Claimed ${BONUSES[Math.floor(Math.random() * BONUSES.length)]}`;
    case 'deposit':
      return `Deposited $${Math.floor(Math.random() * 500)}`;
    case 'withdrawal':
      return `Withdrew $${Math.floor(Math.random() * 1000)}`;
    default:
      return '';
  }
};

/**
 * Generates a list of mock activities for testing and development
 * @param {number} count - The number of activities to generate
 * @param {string[]} types - The types of activities to include
 * @returns {Array} An array of activity objects
 */
export const generateMockActivities = (count = 20, types = null) => {
  const now = new Date();
  const activities = [];
  const activityTypes = types || ['login', 'game-play', 'bonus-claim', 'deposit', 'withdrawal'];
  
  // Generate random activities
  for (let i = 0; i < count; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const timeOffset = Math.floor(Math.random() * 72); // Up to 72 hours ago
    const timestamp = subHours(now, timeOffset);
    const playerId = Math.floor(Math.random() * 100);
    
    activities.push({
      id: `activity-${i}`,
      type,
      playerId: `player-${playerId}`,
      playerName: `Player ${playerId}`,
      details: getActivityDetails(type),
      timestamp
    });
  }
  
  // Sort by timestamp (most recent first)
  return activities.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Format a timestamp into a human-readable format (e.g., "2 hrs ago", "1 day ago")
 * @param {Date} timestamp - The timestamp to format
 * @returns {string} The formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  const now = new Date();
  const diffHours = Math.round((now - timestamp) / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
};

export default {
  generateMockActivities,
  formatTimestamp
};