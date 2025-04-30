/**
 * Factory function to create a standardized API hook for a feature
 * This provides a consistent pattern for all feature APIs
 */

import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { handleApiError, ErrorDomain } from '../error';
import { createEntityHooks } from './hookFactory';
import { DataCategory } from './reactQueryConfig';
import { CACHE_KEYS } from './cacheConfig';
import { toast } from 'sonner';

/**
 * Creates a standardized API hook for a feature
 *
 * @param entityName The name of the entity (e.g., 'players', 'games', 'bonuses')
 * @param apiService The API service for the entity
 * @param schemas Optional Zod schemas for validation
 * @param errorDomain The error domain for error handling
 * @returns A standardized API hook for the feature
 */
export function createFeatureApi<
  TEntity extends { id: number | string },
  TCreateInput = Omit<TEntity, 'id'>,
  TUpdateInput = Partial<TEntity>,
  TParams = Record<string, any>
>(
  entityName: string,
  apiService: {
    getAll: (params?: TParams) => Promise<TEntity[]>;
    getById: (id: number | string) => Promise<TEntity>;
    create: (data: TCreateInput) => Promise<TEntity>;
    update: (id: number | string, data: TUpdateInput) => Promise<TEntity>;
    remove: (id: number | string) => Promise<void>;
    [key: string]: any;
  },
  schemas?: {
    entity?: z.ZodType<TEntity>;
    createInput?: z.ZodType<TCreateInput>;
    updateInput?: z.ZodType<TUpdateInput>;
    params?: z.ZodType<TParams>;
  },
  errorDomain: ErrorDomain = ErrorDomain.GENERAL
) {
  // Create the base entity hooks
  const entityHooks = createEntityHooks<TEntity, TCreateInput, TUpdateInput>(
    entityName,
    apiService,
    DataCategory[entityName.toUpperCase() as keyof typeof DataCategory] || DataCategory.GENERAL
  );

  // Return a hook that provides all the API operations
  return function useFeatureApi() {
    const queryClient = useQueryClient();

    // Create enhanced versions of the base hooks with better error handling and validation
    return {
      // Query hooks
      getAll: (params?: TParams) => {
        // Validate params if schema is provided
        if (schemas?.params && params) {
          try {
            schemas.params.parse(params);
          } catch (error) {
            console.error('Invalid params:', error);
          }
        }

        return entityHooks.useGetAll(params);
      },

      getById: (id?: number | string) => {
        return entityHooks.useGetById(id);
      },

      // Mutation hooks
      create: () => {
        const mutation = entityHooks.useCreate();

        return {
          ...mutation,
          mutateAsync: async (data: TCreateInput) => {
            // Validate input if schema is provided
            if (schemas?.createInput) {
              try {
                schemas.createInput.parse(data);
              } catch (error) {
                handleApiError(error as Error, `Invalid ${entityName.slice(0, -1)} data`, {
                  domain: errorDomain
                });
                throw error;
              }
            }

            try {
              const result = await mutation.mutateAsync(data);
              toast.success(`${entityName.slice(0, -1)} created successfully`);
              return result;
            } catch (error) {
              handleApiError(error as Error, `Failed to create ${entityName.slice(0, -1)}`, {
                domain: errorDomain
              });
              throw error;
            }
          }
        };
      },

      update: () => {
        const mutation = entityHooks.useUpdate();

        return {
          ...mutation,
          mutateAsync: async ({ id, data }: { id: number | string; data: TUpdateInput }) => {
            // Validate input if schema is provided
            if (schemas?.updateInput) {
              try {
                schemas.updateInput.parse(data);
              } catch (error) {
                handleApiError(error as Error, `Invalid ${entityName.slice(0, -1)} data`, {
                  domain: errorDomain
                });
                throw error;
              }
            }

            try {
              const result = await mutation.mutateAsync({ id, data });
              toast.success(`${entityName.slice(0, -1)} updated successfully`);
              return result;
            } catch (error) {
              handleApiError(error as Error, `Failed to update ${entityName.slice(0, -1)}`, {
                domain: errorDomain
              });
              throw error;
            }
          }
        };
      },

      delete: () => {
        const mutation = entityHooks.useDelete();

        return {
          ...mutation,
          mutateAsync: async (id: number | string) => {
            try {
              const result = await mutation.mutateAsync(id as number);
              toast.success(`${entityName.slice(0, -1)} deleted successfully`);
              return result;
            } catch (error) {
              handleApiError(error as Error, `Failed to delete ${entityName.slice(0, -1)}`, {
                domain: errorDomain
              });
              throw error;
            }
          }
        };
      },

      // Helper for creating custom queries
      createCustomQuery: <TData,>(
        name: string,
        queryFn: (id: number | string) => Promise<TData>,
        options?: {
          validateResponse?: z.ZodType<TData>;
        }
      ) => {
        return (id?: number | string) => {
          const query = entityHooks.createCustomQuery<TData>(
            name,
            queryFn as (id: number) => Promise<TData>
          )(id as number);

          // Add validation for the response
          if (options?.validateResponse && query.data) {
            try {
              options.validateResponse.parse(query.data);
            } catch (error) {
              console.error(`Invalid ${name} response:`, error);
            }
          }

          return query;
        };
      },

      // Helper for creating custom mutations
      createCustomMutation: <TData, TVariables,>(
        name: string,
        mutationFn: (variables: TVariables) => Promise<TData>,
        options?: {
          validateInput?: z.ZodType<TVariables>;
          validateResponse?: z.ZodType<TData>;
          invalidateQueries?: string[];
          updateQueries?: Array<{
            queryKey: unknown[];
            updater: (oldData: any, newData: TData) => any;
          }>;
          successMessage?: string;
          errorMessage?: string;
        }
      ) => {
        const customMutation = entityHooks.createCustomMutation<TData, TVariables>(
          mutationFn,
          {
            invalidateQueries: options?.invalidateQueries,
            updateQueries: options?.updateQueries
          }
        )();

        return {
          ...customMutation,
          mutateAsync: async (variables: TVariables) => {
            // Validate input if schema is provided
            if (options?.validateInput) {
              try {
                options.validateInput.parse(variables);
              } catch (error) {
                handleApiError(error as Error, `Invalid ${name} data`, {
                  domain: errorDomain
                });
                throw error;
              }
            }

            try {
              const result = await customMutation.mutateAsync(variables);

              // Validate response if schema is provided
              if (options?.validateResponse) {
                try {
                  options.validateResponse.parse(result);
                } catch (error) {
                  console.error(`Invalid ${name} response:`, error);
                }
              }

              if (options?.successMessage) {
                toast.success(options.successMessage);
              }

              return result;
            } catch (error) {
              handleApiError(error as Error, options?.errorMessage || `${name} operation failed`, {
                domain: errorDomain
              });
              throw error;
            }
          }
        };
      }
    };
  };
}

export default createFeatureApi;
