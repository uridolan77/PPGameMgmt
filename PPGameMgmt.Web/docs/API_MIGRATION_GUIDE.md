# API Migration Guide

This guide explains how to migrate from older API patterns to the new standardized API pattern using the `createFeatureApi` factory.

## API Pattern Evolution

The codebase has gone through several iterations of API patterns:

1. **Original Pattern**: Individual hooks in separate files (e.g., `usePlayers.ts`)
2. **V1 Pattern**: API hook facades that return a collection of hooks (e.g., `usePlayerApi.ts`)
3. **V2 Pattern**: Using the `createEntityHooks` factory (e.g., `usePlayerApiV2.ts`)
4. **V3 Pattern**: Enhanced API hooks with validation using the `createFeatureApi` factory (e.g., `usePlayerApiV3.ts`)

## Benefits of the New Pattern

The new V3 pattern provides several benefits:

- **Type Safety**: Full TypeScript support with proper typing
- **Validation**: Zod schema validation for inputs and responses
- **Consistency**: Standardized pattern across all features
- **Error Handling**: Centralized error handling with domain-specific error messages
- **Optimistic Updates**: Built-in support for optimistic updates
- **Toast Notifications**: Automatic success and error notifications
- **Cache Management**: Consistent cache invalidation and updates

## Migration Steps

### 1. Create Zod Schemas

First, create Zod schemas for your entity:

```typescript
// src/features/your-feature/schemas/yourFeatureSchemas.ts
import { z } from 'zod';

export const yourEntitySchema = z.object({
  id: z.number(),
  name: z.string().min(3),
  // Add more fields...
});

export const createEntitySchema = yourEntitySchema.omit({ id: true });
export const updateEntitySchema = yourEntitySchema.partial().omit({ id: true });

export const yourFeatureSchemas = {
  entity: yourEntitySchema,
  createEntity: createEntitySchema,
  updateEntity: updateEntitySchema,
};

export default yourFeatureSchemas;
```

### 2. Create the API Service

Ensure your API service follows the standard pattern:

```typescript
// src/features/your-feature/services/yourFeatureApi.ts
import { createApiHelpers } from '../../../core/api';
import { YourEntity } from '../types';

export const yourFeatureApi = {
  getAll: (params?: any) => 
    createApiHelpers.getList<YourEntity>('your-entities')(params),
    
  getById: createApiHelpers.getOne<YourEntity>('your-entities'),
  
  create: createApiHelpers.create<YourEntity, Omit<YourEntity, 'id'>>('your-entities'),
  
  update: createApiHelpers.update<YourEntity, Partial<YourEntity>>('your-entities'),
  
  remove: createApiHelpers.remove('your-entities'),
  
  // Add custom methods as needed
};
```

### 3. Create the Enhanced API Hook

Use the `createFeatureApi` factory to create your enhanced API hook:

```typescript
// src/features/your-feature/hooks/useYourFeatureApiV3.ts
import { createFeatureApi } from '../../../core/api';
import { ErrorDomain } from '../../../core/error';
import { yourFeatureApi } from '../services';
import { yourFeatureSchemas } from '../schemas/yourFeatureSchemas';
import { CACHE_KEYS } from '../../../core/api/cacheConfig';

// Create the enhanced API hook
const useYourFeatureApiV3 = createFeatureApi(
  'your-entities',
  yourFeatureApi,
  {
    entity: yourFeatureSchemas.entity,
    createInput: yourFeatureSchemas.createEntity,
    updateInput: yourFeatureSchemas.updateEntity,
  },
  ErrorDomain.YOUR_FEATURE
);

// Export the hook
export { useYourFeatureApiV3 };

// Create and export individual hooks for specific operations
export function useYourEntitiesQueryV3(params?: any) {
  const api = useYourFeatureApiV3();
  return api.getAll(params);
}

export function useYourEntityQueryV3(id?: number) {
  const api = useYourFeatureApiV3();
  return api.getById(id);
}

// Add more hooks as needed...

export default useYourFeatureApiV3;
```

### 4. Update Your Components

Update your components to use the new API hooks:

```tsx
// Before
import { useYourEntityQuery, useUpdateYourEntityMutation } from '../hooks';

function YourComponent() {
  const { data: entity, isLoading } = useYourEntityQuery(id);
  const updateMutation = useUpdateYourEntityMutation();
  
  const handleUpdate = async (data) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      // Show success message
    } catch (error) {
      // Handle error
    }
  };
  
  // ...
}

// After
import { useYourEntityQueryV3, useUpdateYourEntityMutationV3 } from '../hooks';

function YourComponent() {
  const { data: entity, isLoading } = useYourEntityQueryV3(id);
  const updateMutation = useUpdateYourEntityMutationV3();
  
  const handleUpdate = async (data) => {
    try {
      // Validation and error handling are built-in
      await updateMutation.mutateAsync({ id, data });
      // Success message is shown automatically
    } catch (error) {
      // Error is already handled, but you can add custom handling if needed
    }
  };
  
  // ...
}
```

## Example Usage

### Basic Queries

```tsx
import { useYourEntitiesQueryV3 } from '../hooks';

function YourList() {
  const { data, isLoading, error } = useYourEntitiesQueryV3({ status: 'active' });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div>
      {data?.map(item => (
        <YourListItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Mutations

```tsx
import { useCreateYourEntityMutationV3 } from '../hooks';

function CreateEntityForm() {
  const createMutation = useCreateYourEntityMutationV3();
  
  const handleSubmit = async (formData) => {
    try {
      // Input validation happens automatically
      const newEntity = await createMutation.mutateAsync(formData);
      // Success toast is shown automatically
      navigate(`/your-entities/${newEntity.id}`);
    } catch (error) {
      // Error is already handled with a toast notification
      // You can add custom error handling if needed
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Custom Queries and Mutations

```tsx
import { useYourFeatureApiV3 } from '../hooks';

function YourCustomComponent() {
  const api = useYourFeatureApiV3();
  
  // Custom query
  const { data, isLoading } = api.createCustomQuery(
    'custom-data',
    (id) => yourFeatureApi.getCustomData(id),
    {
      validateResponse: customDataSchema,
    }
  )(entityId);
  
  // Custom mutation
  const customMutation = api.createCustomMutation(
    'perform-action',
    (params) => yourFeatureApi.performAction(params),
    {
      invalidateQueries: [CACHE_KEYS.YOUR_ENTITIES],
      successMessage: 'Action performed successfully',
      errorMessage: 'Failed to perform action',
    }
  );
  
  // ...
}
```

## Best Practices

1. **Use Zod Schemas**: Always define Zod schemas for your entities and inputs
2. **Consistent Naming**: Follow the naming convention `useYourFeatureApiV3` for the main hook
3. **Export Individual Hooks**: Export individual hooks for common operations
4. **Error Domains**: Use the appropriate error domain for better error messages
5. **Cache Keys**: Use the centralized cache keys from `cacheConfig.ts`
6. **Optimistic Updates**: Use the `updateQueries` option for optimistic updates
7. **Custom Queries**: Use `createCustomQuery` for feature-specific queries
8. **Custom Mutations**: Use `createCustomMutation` for feature-specific mutations

## Troubleshooting

### Validation Errors

If you're seeing validation errors:

1. Check your Zod schemas to ensure they match your API data
2. Use `.optional()` for fields that might be missing
3. Use `.nullable()` for fields that might be null
4. Use `.or()` for fields that might have different types

### Cache Issues

If you're having cache issues:

1. Make sure you're using the correct cache keys
2. Check your `invalidateQueries` and `updateQueries` options
3. Use the React Query DevTools to inspect your cache

### Type Errors

If you're seeing TypeScript errors:

1. Make sure your types match your Zod schemas
2. Use `z.infer<typeof yourSchema>` to derive types from schemas
3. Check the generic type parameters in your API hooks
