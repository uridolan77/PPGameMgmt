import { Player } from '../types';

// Generate mock player data
export const mockPlayers: Player[] = [
  {
    id: 1,
    username: 'johndoe',
    email: 'john.doe@example.com',
    playerLevel: 42,
    segment: 'VIP',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isActive: true
  },
  {
    id: 2,
    username: 'janedoe',
    email: 'jane.doe@example.com',
    playerLevel: 38,
    segment: 'Premium',
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isActive: true
  },
  {
    id: 3,
    username: 'bobsmith',
    email: 'bob.smith@example.com',
    playerLevel: 15,
    segment: 'Standard',
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isActive: true
  },
  {
    id: 4,
    username: 'alicejones',
    email: 'alice.jones@example.com',
    playerLevel: 27,
    segment: 'Premium',
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isActive: true
  },
  {
    id: 5,
    username: 'mikebrown',
    email: 'mike.brown@example.com',
    playerLevel: 8,
    segment: 'Standard',
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    isActive: false
  },
  {
    id: 6,
    username: 'sarahwilson',
    email: 'sarah.wilson@example.com',
    playerLevel: 51,
    segment: 'VIP',
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    isActive: true
  },
  {
    id: 7,
    username: 'davidmiller',
    email: 'david.miller@example.com',
    playerLevel: 19,
    segment: 'Standard',
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    isActive: false
  },
  {
    id: 8,
    username: 'emmataylor',
    email: 'emma.taylor@example.com',
    playerLevel: 33,
    segment: 'Premium',
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isActive: true
  },
  {
    id: 9,
    username: 'jamesanderson',
    email: 'james.anderson@example.com',
    playerLevel: 22,
    segment: 'Standard',
    lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    isActive: true
  },
  {
    id: 10,
    username: 'oliviamartin',
    email: 'olivia.martin@example.com',
    playerLevel: 47,
    segment: 'VIP',
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isActive: true
  },
  {
    id: 11,
    username: 'williamjackson',
    email: 'william.jackson@example.com',
    playerLevel: 12,
    segment: 'Standard',
    lastLogin: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    isActive: false
  },
  {
    id: 12,
    username: 'sophiawhite',
    email: 'sophia.white@example.com',
    playerLevel: 29,
    segment: 'Premium',
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isActive: true
  }
];

export default mockPlayers;
