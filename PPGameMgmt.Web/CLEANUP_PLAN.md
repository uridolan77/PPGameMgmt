# PPGameMgmt Web Codebase Cleanup Plan

This document outlines the plan for cleaning up the PPGameMgmt Web codebase to improve maintainability, reduce duplication, and standardize patterns.

## Completed Changes

### 1. Consolidated API Hook Factory

- Created a unified API hook factory in `core/api/hookFactory.ts`
- This factory provides a consistent pattern for creating API hooks across features
- Example implementation in `features/players/hooks/usePlayerApiV2.ts`

### 2. Consolidated Error Handling

- Consolidated error handling utilities from `shared/utils/errorHandling.ts` and `core/error/globalErrorHandler.ts`
- Created a new `core/error/errorUtils.ts` that provides a unified error handling system
- Updated imports in key files to use the new error handling utilities

### 3. Centralized Cache Configuration

- Created a centralized cache configuration in `core/api/cacheConfig.ts`
- This provides consistent cache keys and stale times across features
- Updated imports in key files to use the centralized cache configuration

### 4. Unified Theme System

- Created a unified theme system in `core/theme/theme.ts`
- This replaces the duplicate theme definitions in `utils/theme.js` and `core/theme/index.ts`
- Provides a consistent approach to theming using Tailwind CSS and shadcn/ui

### 5. Consolidated Development Utilities

- Created a unified development utilities module in `core/dev/renderTracker.ts`
- This replaces the duplicate `useRenderTracker` implementations
- Added additional development utilities in `core/dev/index.ts`

## Remaining Tasks

### 1. Update Imports Across the Codebase

- Update imports from `shared/utils/errorHandling` to use `core/error/errorUtils`
- Update imports of `useRenderTracker` to use `core/dev`
- Update imports of theme utilities to use `core/theme`
- Update API hooks to use the new `createEntityHooks` factory
- Update cache keys and stale times to use the centralized `core/api/cacheConfig`

### 2. Standardize Component Structure

- Implement a consistent component folder structure across features:
  ```
  ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.test.tsx
    ├── ComponentName.stories.tsx (if using Storybook)
    └── index.ts
  ```

### 3. Remove Deprecated Code

- Remove the deprecated API client in `core/api/apiClient.ts`
- Remove duplicate utility functions
- Remove unused imports and variables

### 4. Standardize Error Handling

- Update all error handling to use the new consolidated error handling system
- Replace direct toast calls with the new `handleApiError` function
- Update error boundaries to use the new error handling utilities

### 5. Optimize React Query Usage

- Update all React Query usage to use the new centralized cache configuration
- Implement consistent query key structure
- Use the new hook factory for all API hooks

### 6. Standardize Component Imports

- Standardize on shadcn/ui components
- Update all component imports to use the new pattern

## Migration Guide

### Updating Error Handling

```typescript
// Before
import { handleApiError } from '../../../shared/utils/errorHandling';

// After
import { handleApiError } from '../../../core/error';
```

### Updating Cache Keys and Stale Times

```typescript
// Before
const CACHE_KEYS = {
  GAMES: 'games',
  GAME: 'game',
}

const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
}

// After
import { CACHE_KEYS, STALE_TIMES } from '../../../core/api/cacheConfig';
```

### Using the New Hook Factory

```typescript
// Before
export function useGames(filters?: GameFilter) {
  const queryClient = useQueryClient();

  // Main query to fetch games list
  const gamesQuery = useApiQuery<Game[]>(
    [CACHE_KEYS.GAMES, filters],
    () => gameApi.getAll(filters),
    {
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // ...
}

// After
import { createEntityHooks } from '../../../core/api';
import { DataCategory } from '../../../core/api/reactQueryConfig';

const gameHooks = createEntityHooks<Game>(
  'games',
  gameApi,
  DataCategory.GAME
);

export const useGamesQuery = gameHooks.useGetAll;
export const useGameQuery = gameHooks.useGetById;
export const useCreateGameMutation = gameHooks.useCreate;
export const useUpdateGameMutation = gameHooks.useUpdate;
export const useDeleteGameMutation = gameHooks.useDelete;
```

### Using the New Development Utilities

```typescript
// Before
import { useRenderTracker } from '../../../shared/hooks';

// After
import { useRenderTracker } from '../../../core/dev';
```

## Benefits of the Cleanup

1. **Reduced Duplication**: Consolidated duplicate code across the codebase
2. **Improved Maintainability**: Standardized patterns make the code easier to maintain
3. **Better Error Handling**: Consolidated error handling provides a more consistent user experience
4. **Optimized Caching**: Centralized cache configuration ensures consistent caching behavior
5. **Simplified API Hooks**: The new hook factory makes it easier to create and maintain API hooks
6. **Improved Development Experience**: Consolidated development utilities make it easier to debug and optimize the application

## Next Steps

After completing the cleanup, we should:

1. **Update Documentation**: Update the documentation to reflect the new patterns
2. **Add Tests**: Add tests for the new utilities and hooks
3. **Performance Optimization**: Optimize the application for performance
4. **Accessibility Improvements**: Improve accessibility across the application
5. **Mobile Responsiveness**: Ensure the application is fully responsive on mobile devices
