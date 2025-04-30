# UI Component Library Guide

## Overview

This guide outlines the consolidated UI component library structure for PPGameMgmt. All UI components should be sourced from our centralized library at `src/lib/ui`, which extends the base shadcn/ui components with application-specific enhancements.

## Component Categories

Our UI components are organized into the following categories:

1. **Navigation** - Components for user navigation (navbar, tabs, breadcrumbs)
2. **Layout** - Components for page structure (containers, grids, dividers)
3. **Inputs** - Form controls and input elements (text fields, selects, radios)
4. **Feedback** - Components that provide user feedback (alerts, toasts, progress indicators)
5. **Data Display** - Components for showing data (tables, cards, lists)

## Usage Guidelines

### When to use shadcn/ui base components

Use base components from `@/lib/ui` (which re-exports shadcn/ui components) when:
- You need a simple, unstyled UI primitive
- You're building a new custom component that composes multiple primitives
- The component doesn't require application-specific business logic

```tsx
import { Button } from '@/lib/ui';

function MyComponent() {
  return <Button>Click me</Button>;
}
```

### When to use enhanced components

Use enhanced components from their respective categories when:
- You need consistent styling and behavior across the application
- The component requires application-specific functionality
- You need to integrate with application state or services

```tsx
import { SearchInput } from '@/lib/ui/inputs';

function MyComponent() {
  return <SearchInput onSearch={handleSearch} placeholder="Search players..." />;
}
```

## Component Migration

### Deprecated Components

The following component implementations are now deprecated and should be migrated:

1. Custom components in `src/shared/components/ui-kit`
   - Migrate to equivalent components in `src/lib/ui/{category}`

2. Feature-specific component duplicates
   - If the component is specific to a feature, consider if it should be generalized
   - If generally useful, move to the appropriate category in `src/lib/ui`
   - If truly feature-specific, keep in the feature directory but use UI library primitives

## Migration Steps

1. **Identify** - Find all instances of deprecated components
2. **Evaluate** - Determine if the component should be:
   - Replaced with a shadcn/ui component
   - Migrated to an enhanced component
   - Kept as a feature-specific component
3. **Migrate** - Update imports and component usage
4. **Test** - Verify the component works as expected
5. **Remove** - Delete the deprecated component

### Detailed Migration Example

**Before:**
```tsx
// src/features/players/components/PlayerTable.tsx
import { Table } from '@/shared/components/ui-kit/data-display/Table';
import { SearchInput } from '@/shared/components/ui-kit/inputs/SearchInput';
import { StatusBadge } from '@/shared/components/ui-kit/data-display/StatusBadge';

export const PlayerTable = ({ players }) => {
  return (
    <div>
      <SearchInput 
        onSearch={handleSearch} 
        placeholder="Search players..." 
      />
      <Table
        data={players}
        columns={[
          // ...column definitions
          {
            header: 'Status',
            accessor: 'status',
            cell: ({ value }) => (
              <StatusBadge 
                status={value === 'active' ? 'success' : 'error'} 
                label={value} 
              />
            )
          }
        ]}
      />
    </div>
  );
};
```

**After:**
```tsx
// src/features/players/components/PlayerTable.tsx
import { Table } from '@/lib/ui/data-display/Table';
import { SearchInput } from '@/lib/ui/inputs';
import { StatusBadge } from '@/lib/ui/data-display';

export const PlayerTable = ({ players }) => {
  return (
    <div>
      <SearchInput 
        onSearch={handleSearch} 
        placeholder="Search players..." 
      />
      <Table
        data={players}
        columns={[
          // ...column definitions
          {
            header: 'Status',
            accessor: 'status',
            cell: ({ value }) => (
              <StatusBadge 
                status={value === 'active' ? 'success' : 'error'} 
                label={value} 
              />
            )
          }
        ]}
      />
    </div>
  );
};
```

## Creating New Components

When creating new UI components:

1. Determine if the component belongs in the centralized library or is feature-specific
2. Place the component in the appropriate category folder
3. Export the component from the category's index.ts file
4. Document the component's purpose and usage
5. Follow the project's naming conventions

## Component Documentation

Each component in the UI library should include:

1. JSDoc comments for the component and its props
2. Example usage in the JSDoc comments
3. Relevant types and interfaces
4. Accessibility considerations

Example:
```tsx
/**
 * SearchInput component for searching content
 * 
 * @example
 * ```tsx
 * <SearchInput 
 *   onSearch={handleSearch} 
 *   placeholder="Search players..."
 *   initialValue="John"
 * />
 * ```
 */
export const SearchInput: React.FC<SearchInputProps> = ({ ... }) => {
  // Component implementation
};
```

## Best Practices

- Use TypeScript for all components
- Leverage composition over inheritance
- Make components responsive by default
- Ensure accessibility compliance
- Write unit tests for all components
- Document props and usage examples

## Deprecation Strategy

For components that need to be deprecated:

1. Mark the component with a `@deprecated` JSDoc tag
2. Add a comment indicating the replacement component
3. Log a console warning when the component is used
4. Create an issue to track the migration
5. Set a deadline for removing the deprecated component

Example of marking a component as deprecated:
```tsx
/**
 * @deprecated Use StatusBadge from @/lib/ui/data-display instead
 */
export const LegacyStatusBadge = ({ ... }) => {
  console.warn('LegacyStatusBadge is deprecated. Use StatusBadge from @/lib/ui/data-display instead.');
  // Component implementation
};
```
