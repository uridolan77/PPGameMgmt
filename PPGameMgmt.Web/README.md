# PPGameMgmt Web Application

## Project Overview

PPGameMgmt is a comprehensive platform for managing gaming operations, including game inventory, player management, and bonus campaigns.

## Architecture and Structure

This project follows a feature-based structure with clean separation of concerns:

```
src/
├── assets/         # Static assets like images and icons
├── core/           # Core application services and utilities
│   ├── api/        # API client and communication layer
│   ├── error/      # Error handling and boundaries
│   ├── i18n/       # Internationalization
│   ├── layouts/    # Application layouts
│   ├── logger/     # Logging services
│   ├── routing/    # Routing configuration
│   ├── store/      # Global state management
│   └── theme/      # Theme configuration
├── features/       # Feature modules
│   ├── auth/       # Authentication
│   ├── dashboard/  # Dashboard
│   ├── games/      # Games management
│   ├── players/    # Player management
│   └── bonuses/    # Bonus campaigns
├── shared/         # Shared components, hooks, and utilities
│   ├── components/ # Shared UI components
│   ├── hooks/      # Custom hooks
│   └── utils/      # Utility functions
└── utils/          # Global utility functions
```

## Feature Module Structure

Each feature module follows this consistent structure:

```
feature/
├── index.ts        # Public API of the feature
├── types.ts        # TypeScript types and interfaces
├── components/     # UI components
├── hooks/          # Feature-specific hooks
├── pages/          # Route components
├── services/       # Feature-specific services
└── store/          # Feature state management
```

## Key Conventions

### Imports

- Import from feature modules using the public API:
  ```typescript
  import { GameCard, useGames } from '@/features/games';
  ```
- Avoid importing directly from internal files:
  ```typescript
  // Avoid this
  import { GameCard } from '@/features/games/components/GameCard';
  ```

### API Access

- Use the centralized ApiClient for all API requests
- The client handles authentication, error handling, and request/response formatting

### Component Props

- Define explicit interfaces for component props
- Use consistent naming conventions
- Document props with JSDoc comments for complex components

### State Management

- Use React Query for server state management
- Use Zustand for UI and local state management
- Export state hooks from feature modules

## Development Workflow

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Building

```
npm run build
```

### Testing

```
npm run test
```

## Best Practices

1. **TypeScript**: Use strict typing throughout the application
2. **Component Organization**: Keep components small and focused
3. **Error Handling**: Implement proper error boundaries and fallbacks
4. **Performance**: Use React.memo, useMemo, and useCallback appropriately
5. **Testing**: Write unit tests for critical functionality
6. **Accessibility**: Ensure all components meet WCAG standards
