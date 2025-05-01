export interface Game {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: string;
  type: string;
  genre: string;
  isFeatured: boolean;
  rtp: number;
  minBet: number;
  maxBet: number;
  releaseDate: string;
  thumbnailUrl: string;
  gameUrl: string;
  isActive: boolean;
  popularity: number;
  volatility?: string;
  compatibleDevices?: string[];
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