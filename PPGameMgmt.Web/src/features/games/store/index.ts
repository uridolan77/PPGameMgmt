/**
 * Games Feature Store
 * 
 * Zustand store implementation for the games feature with middleware
 * for persistence and devtools integration.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Game, GameFilter, GameCategory } from '../types';

interface GamesState {
  // State
  games: Game[];
  selectedGameId: string | null;
  isLoading: boolean;
  filters: GameFilter;
  
  // Actions
  setGames: (games: Game[]) => void;
  selectGame: (gameId: string | null) => void;
  addGame: (game: Game) => void;
  updateGame: (updatedGame: Game) => void;
  removeGame: (gameId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setFilters: (filters: Partial<GameFilter>) => void;
  resetFilters: () => void;

  // Selectors (computed values)
  getGameById: (id: string) => Game | undefined;
  getFilteredGames: () => Game[];
  getGamesByCategory: (category: GameCategory) => Game[];
}

// Initial state for the games store
const initialState = {
  games: [],
  selectedGameId: null,
  isLoading: false,
  filters: {
    searchQuery: '',
    categories: [],
    status: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  }
};

// Default filter states
const defaultFilters: GameFilter = {
  searchQuery: '',
  categories: [],
  status: 'all',
  sortBy: 'name',
  sortDirection: 'asc'
};

// Create the store with middleware
export const useGamesStore = create<GamesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,
        
        // Actions
        setGames: (games) => set({ games }),
        
        selectGame: (gameId) => set({ selectedGameId: gameId }),
        
        addGame: (game) => set((state) => ({ 
          games: [...state.games, game] 
        })),
        
        updateGame: (updatedGame) => set((state) => ({
          games: state.games.map(game => 
            game.id === updatedGame.id ? updatedGame : game
          )
        })),
        
        removeGame: (gameId) => set((state) => ({
          games: state.games.filter(game => game.id !== gameId),
          // Clear selection if the removed game was selected
          selectedGameId: state.selectedGameId === gameId 
            ? null 
            : state.selectedGameId
        })),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
        
        resetFilters: () => set({ filters: defaultFilters }),
        
        // Selectors
        getGameById: (id) => {
          return get().games.find(game => game.id === id);
        },
        
        getFilteredGames: () => {
          const { games, filters } = get();
          let filteredGames = [...games];
          
          // Apply search filter
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredGames = filteredGames.filter(game =>
              game.name.toLowerCase().includes(query) ||
              game.description?.toLowerCase().includes(query)
            );
          }
          
          // Apply category filter
          if (filters.categories.length > 0) {
            filteredGames = filteredGames.filter(game =>
              filters.categories.some(category => game.categories.includes(category))
            );
          }
          
          // Apply status filter
          if (filters.status !== 'all') {
            filteredGames = filteredGames.filter(game => 
              game.status === filters.status
            );
          }
          
          // Apply sorting
          filteredGames.sort((a, b) => {
            const sortBy = filters.sortBy;
            const direction = filters.sortDirection === 'asc' ? 1 : -1;
            
            if (sortBy === 'name') {
              return a.name.localeCompare(b.name) * direction;
            }
            
            if (sortBy === 'releaseDate') {
              return ((new Date(a.releaseDate)).getTime() - 
                     (new Date(b.releaseDate)).getTime()) * direction;
            }
            
            if (sortBy === 'popularity') {
              return (a.popularity - b.popularity) * direction;
            }
            
            return 0;
          });
          
          return filteredGames;
        },
        
        getGamesByCategory: (category) => {
          return get().games.filter(game => 
            game.categories.includes(category)
          );
        }
      }),
      {
        name: 'games-storage',
        // Only persist specific fields
        partialize: (state) => ({
          filters: state.filters,
          selectedGameId: state.selectedGameId
        }),
      }
    )
  )
);