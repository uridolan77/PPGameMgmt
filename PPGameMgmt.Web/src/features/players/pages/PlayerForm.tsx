import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api';

// TypeScript interface for player form data
interface PlayerFormInputs {
  id?: number;
  username: string;
  email: string;
  playerLevel: number;
  isActive: boolean;
}

interface PlayerFormProps {
  playerId?: number;
  onSuccess?: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ playerId, onSuccess }) => {
  const queryClient = useQueryClient();
  
  // Initialize React Hook Form with TypeScript types
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<PlayerFormInputs>();
  
  // Fetch player data if editing an existing player
  const { data: playerData, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return undefined;
      // Use the improved apiClient
      return apiClient.get<PlayerFormInputs>(`/api/players/${playerId}`);
    },
    enabled: !!playerId,
    onSuccess: (data) => {
      if (data) {
        reset(data); // Pre-fill form with existing data
      }
    }
  });

  // Create or update player mutation
  const mutation = useMutation({
    mutationFn: async (data: PlayerFormInputs) => {
      if (playerId) {
        // Use the improved apiClient for PUT request
        return apiClient.put<PlayerFormInputs>(`/api/players/${playerId}`, data);
      } else {
        // Use the improved apiClient for POST request
        return apiClient.post<PlayerFormInputs>('/api/players', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      reset();
      if (onSuccess) onSuccess();
    }
  });

  // Handle form submission
  const onSubmit: SubmitHandler<PlayerFormInputs> = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading player data...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {playerId ? 'Edit Player' : 'Create New Player'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player Level
          </label>
          <input
            type="number"
            {...register('playerLevel', { 
              required: 'Player level is required',
              min: { value: 1, message: 'Level must be at least 1' },
              valueAsNumber: true
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.playerLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.playerLevel.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active Player
          </label>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Player'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerForm;