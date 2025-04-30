/**
 * Zod schemas for player-related data validation
 */
import { z } from 'zod';

// Schema for player entity
export const playerSchema = z.object({
  id: z.number(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  playerLevel: z.number().min(1).max(100).default(1),
  segment: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.string().optional().or(z.date().optional()),
  registrationDate: z.string().optional().or(z.date().optional()),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  balance: z.number().optional(),
  lastLoginDate: z.string().optional().or(z.date().optional()),
  avatarUrl: z.string().optional(),
});

// Schema for creating a new player
export const createPlayerSchema = playerSchema.omit({ id: true });

// Schema for updating a player
export const updatePlayerSchema = playerSchema.partial().omit({ id: true });

// Schema for player feature
export const playerFeatureSchema = z.object({
  id: z.number(),
  playerId: z.number(),
  featureId: z.number(),
  featureName: z.string(),
  isEnabled: z.boolean(),
  activationDate: z.string().optional().or(z.date().optional()),
  expirationDate: z.string().optional().or(z.date().optional()),
});

// Schema for player game session
export const gameSessionSchema = z.object({
  id: z.number(),
  playerId: z.number(),
  gameId: z.number(),
  gameName: z.string(),
  startTime: z.string().or(z.date()),
  endTime: z.string().optional().or(z.date().optional()),
  duration: z.number().optional(),
  betAmount: z.number(),
  winAmount: z.number(),
  netResult: z.number(),
  currency: z.string(),
  deviceType: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Schema for player bonus claim
export const bonusClaimSchema = z.object({
  id: z.number(),
  playerId: z.number(),
  bonusId: z.number(),
  bonusName: z.string(),
  claimDate: z.string().or(z.date()),
  expiryDate: z.string().optional().or(z.date().optional()),
  status: z.string(),
  value: z.number(),
  valueType: z.string(),
  wageringRequirement: z.number().optional(),
  wageringProgress: z.number().optional(),
  isCompleted: z.boolean().optional(),
});

// Schema for player query parameters
export const playerQueryParamsSchema = z.object({
  segment: z.string().optional(),
  isActive: z.boolean().optional(),
  country: z.string().optional(),
  minLevel: z.number().optional(),
  maxLevel: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

// Export types derived from schemas
export type Player = z.infer<typeof playerSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type PlayerFeature = z.infer<typeof playerFeatureSchema>;
export type GameSession = z.infer<typeof gameSessionSchema>;
export type BonusClaim = z.infer<typeof bonusClaimSchema>;
export type PlayerQueryParams = z.infer<typeof playerQueryParamsSchema>;

// Export all schemas
export const playerSchemas = {
  player: playerSchema,
  createPlayer: createPlayerSchema,
  updatePlayer: updatePlayerSchema,
  playerFeature: playerFeatureSchema,
  gameSession: gameSessionSchema,
  bonusClaim: bonusClaimSchema,
  queryParams: playerQueryParamsSchema,
};

export default playerSchemas;
