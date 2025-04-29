export interface Game {
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  thumbnailUrl: string;
  category: string;
  provider: string;
  isActive: boolean;
  popularity: number;
  rtp?: number; // Return to Player percentage
  volatility?: 'low' | 'medium' | 'high';
  minBet?: number;
  maxBet?: number;
  features?: string[];
}

export interface GameFilter {
  category?: string;
  provider?: string;
  isActive?: boolean;
  searchTerm?: string;
  sortBy?: 'title' | 'releaseDate' | 'popularity';
  sortDirection?: 'asc' | 'desc';
}

export interface GamesState {
  games: Game[];
  selectedGame: Game | null;
  filters: GameFilter;
  isLoading: boolean;
  error: string | null;
}