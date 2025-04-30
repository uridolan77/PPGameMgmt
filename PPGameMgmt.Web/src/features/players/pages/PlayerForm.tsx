import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

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
    reset,
    setValue,
    watch
  } = useForm<PlayerFormInputs>({
    defaultValues: {
      isActive: true,
      playerLevel: 1
    }
  });

  // Watch the isActive field to use with Switch component
  const watchIsActive = watch('isActive');
  
  // Fetch player data if editing an existing player
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return undefined;
      // Use the improved apiClient
      return apiClient.get<PlayerFormInputs>(`/api/players/${playerId}`);
    },
    enabled: !!playerId
  });

  // Use useEffect to reset form when data is loaded
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

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

  // Handle switch toggle separately since it's not directly bound to register
  const handleSwitchChange = (checked: boolean) => {
    setValue('isActive', checked);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading player data: {(error as Error)?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{playerId ? 'Edit Player' : 'Create New Player'}</CardTitle>
        <CardDescription>
          {playerId 
            ? 'Update the player information below' 
            : 'Fill in the details to create a new player'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="playerLevel">Player Level</Label>
            <Input
              id="playerLevel"
              type="number"
              {...register('playerLevel', { 
                required: 'Player level is required',
                min: { value: 1, message: 'Level must be at least 1' },
                valueAsNumber: true
              })}
              placeholder="Enter player level"
            />
            {errors.playerLevel && (
              <p className="text-sm text-destructive">{errors.playerLevel.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex h-5 w-10 cursor-pointer rounded-full bg-muted p-1"
               onClick={() => handleSwitchChange(!watchIsActive)}>
              <div
                className={`h-3 w-3 rounded-full transition-all ${watchIsActive ? "translate-x-4 bg-primary" : "bg-muted-foreground"}`}
              />
            </div>
            <Label htmlFor="isActive" className="cursor-pointer" onClick={() => handleSwitchChange(!watchIsActive)}>
              Active Player
            </Label>
          </div>
          
          <input type="hidden" {...register('isActive')} />
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save Player'
            )}
          </Button>
        </CardFooter>
      </form>
      
      {mutation.isError && (
        <div className="px-6 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(mutation.error as Error)?.message || 'Failed to save player'}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
};

export default PlayerForm;