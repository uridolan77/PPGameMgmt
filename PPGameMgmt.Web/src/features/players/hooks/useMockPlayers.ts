import { useEffect, useState } from 'react';
import { mockPlayers } from '../mocks/mockPlayers';
import { Player } from '../types';

/**
 * A hook that provides mock player data for development and testing
 */
export function useMockPlayers() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Player[] | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      try {
        setData(mockPlayers);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      }
    }, 800); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => {
        setData(mockPlayers);
        setIsLoading(false);
      }, 800);
    }
  };
}

export default useMockPlayers;
