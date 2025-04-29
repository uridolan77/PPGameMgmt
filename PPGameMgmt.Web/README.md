# PP Game Management Frontend

This is the frontend application for the PP Game Management system. It's built with React, Vite, and uses a combination of Material UI and Tailwind CSS for styling.

## Project Structure

The project follows a modern React application structure:

```plaintext
src/
├── assets/         # Static assets like images
├── components/     # Reusable UI components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── stores/         # Zustand state stores
├── styles/         # Global styles
└── utils/          # Utility functions
```

## Key Technologies

- **React**: UI library
- **Vite**: Build tool
- **React Router**: For routing
- **React Query**: For data fetching and caching
- **Zustand**: For state management
- **Material UI**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: For data visualization

## State Management

The application uses a combination of:

1. **React Query** for server state (API data)
2. **Zustand** for client state, organized into separate stores:
   - `dashboardStore.js`: Dashboard configuration and widget settings
   - `preferencesStore.js`: User preferences that persist across sessions
   - `uiStore.js`: UI-specific state like sidebar open/closed, active tabs, etc.

## Styling Approach

The application uses Tailwind CSS as the primary styling approach, with Material UI components for complex UI elements. The styling is organized as follows:

1. **Tailwind CSS**: For utility-based styling (configured in `postcss.config.js`)
2. **CSS Modules**: For component-specific styles
3. **Material UI Theme**: For consistent theming of Material UI components (configured in `utils/theme.js`)

## Development Guidelines

### Code Organization

- Keep components small and focused on a single responsibility
- Extract complex logic into custom hooks
- Use the appropriate state management solution for each use case:
  - Component state for local UI state
  - React Query for server data
  - Zustand for shared client state

### Styling Guidelines

- Prefer Tailwind CSS classes for styling
- Use Material UI's `sx` prop for Material UI component styling
- Keep CSS modules minimal and only for complex styling that can't be achieved with Tailwind

### TypeScript

The project is set up to support TypeScript. When creating new files, consider using `.tsx` and `.ts` extensions to leverage type safety.

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build
- `npm run test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run lint`: Lint the codebase
