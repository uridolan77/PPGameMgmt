# Contributing to Players Feature

This document provides guidelines and best practices for contributing to the Players feature of the PlayWise Platform Game Management system.

## Code Organization

The feature follows a modular structure:

- **components/** - UI components
- **hooks/** - Custom React hooks
- **pages/** - Page components
- **services/** - API services
- **types/** - TypeScript interfaces and types
- **utils/** - Utility functions

## Development Guidelines

### 1. Component Creation

When creating new components:
- Use functional components with TypeScript and React hooks
- Follow the established naming convention (e.g., `PlayerSomething.tsx`)
- Implement proper loading states and error handling
- Extract reusable components when appropriate
- Add documentation comments

### 2. Type Safety

- Define and use interfaces from the `types` folder
- Avoid using `any` type
- Use proper TypeScript generics and utility types when appropriate

### 3. API Integration

- Use the existing hooks from `hooks/usePlayers.ts`
- Follow the established pattern for data fetching and mutation
- Implement proper error handling
- Utilize loading indicators during data operations

### 4. Testing

- Write unit tests for components using Jest and React Testing Library
- Use mock data utilities from `utils/testUtils.ts` 
- Test edge cases including loading states, error states, and empty data states
- Mock API hooks appropriately

### 5. Storybook Stories

- Create stories for components to showcase different states and variations
- Document component props and usage in Storybook
- Test responsive behavior in Storybook

## Pull Request Guidelines

1. Ensure code passes all tests (`npm test`)
2. Follow the project's code style and conventions
3. Include unit tests for new features
4. Update documentation as needed
5. Keep PRs focused on a single concern

## Best Practices

- **State Management**: Use React Query for server state and local state for UI concerns
- **Error Handling**: Display user-friendly error messages using the `ApiErrorDisplay` component
- **Loading States**: Use Skeleton components or loading indicators during data fetching
- **Reusability**: Extract common patterns into reusable hooks or components