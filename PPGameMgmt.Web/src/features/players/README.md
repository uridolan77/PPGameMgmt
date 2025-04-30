# Players Feature

This feature module manages all player-related functionality in the PlayWise Platform Game Management system.

## Structure

```
players/
  ├── components/       # Reusable UI components
  ├── hooks/           # Custom React hooks
  ├── pages/           # Page components
  ├── services/        # API services
  ├── types/           # TypeScript interfaces and types
  └── utils/           # Utility functions
```

## Components

- `PlayerHeader`: Displays player info and action buttons
- `PlayerOverviewTab`: Overview section in player detail page
- `PlayerGamesTab`: Game history section in player detail page
- `PlayerBonusesTab`: Bonus claims section in player detail page  
- `PlayerFeaturesTab`: Features section in player detail page
- `ApiErrorDisplay`: Reusable error display with retry functionality
- `LoadingIndicator`: Reusable loading spinner with message

## Hooks

The module provides the following custom React hooks:

- `usePlayers`: Fetches a list of all players with optional segment filtering
- `usePlayer`: Fetches a single player by ID
- `usePlayerFeatures`: Fetches features for a specific player
- `usePlayerGameSessions`: Fetches game sessions for a specific player
- `usePlayerBonusClaims`: Fetches bonus claims for a specific player
- `useCreatePlayer`: Creates a new player
- `useUpdatePlayer`: Updates an existing player
- `useDeletePlayer`: Deletes a player

## Usage

### Displaying a Player Detail Page

```tsx
import { PlayerDetail } from '../features/players';

// In a route configuration:
<Route path="/players/:id" element={<PlayerDetail />} />
```

### Using Player Hooks

```tsx
import { usePlayers, useCreatePlayer } from '../features/players';

const PlayerList = () => {
  const { data: players, isLoading } = usePlayers();
  const createPlayer = useCreatePlayer();
  
  const handleAddPlayer = (playerData) => {
    createPlayer.mutate(playerData);
  };
  
  // Component implementation
};
```

## Best Practices

1. Use the provided types from `types/index.ts` for type safety
2. Handle loading and error states in all components
3. Use the `ApiErrorDisplay` component for consistent error handling
4. Follow the established data fetching pattern with React Query