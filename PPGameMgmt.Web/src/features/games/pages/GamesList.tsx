import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GameCard } from '../components';
import { useGames } from '../hooks';
import { Game, GameFilter } from '../types';

const GamesList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GameFilter>({
    isActive: undefined,
    searchTerm: '',
    category: undefined,
    provider: undefined,
    sortBy: 'popularity',
    sortDirection: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Use our custom useGames hook to manage game data
  const { 
    games, 
    isLoading, 
    isError,
    error,
    refetch,
    toggleGameStatus 
  } = useGames(filters);
  
  // Handle game click navigation
  const handleGameClick = (game: Game) => {
    navigate(`/games/${game.id}`);
  };
  
  // Handle adding a new game
  const handleAddGame = () => {
    navigate('/games/new');
  };
  
  // Handle status toggle
  const handleToggleStatus = (game: Game, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleGameStatus.mutate({ id: game.id, isActive: !game.isActive });
  };
  
  // Handle filter changes
  const handleFilterChange = (field: keyof GameFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      isActive: undefined,
      searchTerm: '',
      category: undefined,
      provider: undefined,
      sortBy: 'popularity',
      sortDirection: 'desc'
    });
  };
  
  // Categories and providers (in a real app, these would come from an API)
  const categories = ['Slots', 'Table Games', 'Live Casino', 'Jackpot', 'Other'];
  const providers = ['NetEnt', 'Microgaming', 'Playtech', 'Evolution', 'Pragmatic Play'];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Games Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddGame}
        >
          Add Game
        </Button>
      </Box>
      
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TextField
            label="Search games"
            variant="outlined"
            size="small"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            sx={{ flex: 1 }}
            placeholder="Search by title, provider..."
          />
          <IconButton onClick={() => setShowFilters(!showFilters)} color="primary">
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={() => refetch()} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {showFilters && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                      label="Status"
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange('isActive', value === '' ? undefined : value === 'active');
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category || ''}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Provider</InputLabel>
                    <Select
                      value={filters.provider || ''}
                      label="Provider"
                      onChange={(e) => handleFilterChange('provider', e.target.value || undefined)}
                    >
                      <MenuItem value="">All Providers</MenuItem>
                      {providers.map((provider) => (
                        <MenuItem key={provider} value={provider}>
                          {provider}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={`${filters.sortBy || 'popularity'}_${filters.sortDirection || 'desc'}`}
                      label="Sort By"
                      onChange={(e) => {
                        const [sortBy, sortDirection] = e.target.value.split('_');
                        handleFilterChange('sortBy', sortBy);
                        handleFilterChange('sortDirection', sortDirection);
                      }}
                    >
                      <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                      <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                      <MenuItem value="releaseDate_desc">Newest First</MenuItem>
                      <MenuItem value="releaseDate_asc">Oldest First</MenuItem>
                      <MenuItem value="popularity_desc">Most Popular</MenuItem>
                      <MenuItem value="popularity_asc">Least Popular</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  size="small" 
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {/* Active filters display */}
        {(filters.searchTerm || filters.category || filters.provider || filters.isActive !== undefined) && (
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {filters.searchTerm && (
              <Chip 
                label={`Search: ${filters.searchTerm}`} 
                onDelete={() => handleFilterChange('searchTerm', '')} 
                size="small"
              />
            )}
            {filters.category && (
              <Chip 
                label={`Category: ${filters.category}`} 
                onDelete={() => handleFilterChange('category', undefined)} 
                size="small"
              />
            )}
            {filters.provider && (
              <Chip 
                label={`Provider: ${filters.provider}`} 
                onDelete={() => handleFilterChange('provider', undefined)} 
                size="small"
              />
            )}
            {filters.isActive !== undefined && (
              <Chip 
                label={`Status: ${filters.isActive ? 'Active' : 'Inactive'}`} 
                onDelete={() => handleFilterChange('isActive', undefined)} 
                size="small"
              />
            )}
          </Box>
        )}
      </Box>
      
      {/* Loading and Error States */}
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <Typography>Loading games...</Typography>
        </Box>
      )}
      
      {isError && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          my={4} 
          p={3} 
          bgcolor="error.light" 
          borderRadius={1}
        >
          <Typography color="error" gutterBottom>
            Error loading games
          </Typography>
          <Typography variant="body2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      )}
      
      {/* Games List */}
      {!isLoading && !isError && (
        <>
          <Typography variant="subtitle1" mb={2} color="text.secondary">
            {games.length} games found
          </Typography>
          
          {games.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              p={4}
              bgcolor="background.paper"
              borderRadius={1}
              border={1}
              borderColor="divider"
            >
              <Typography variant="h6" gutterBottom>
                No games found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Try adjusting your filters or add a new game
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleAddGame}
              >
                Add Game
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {games.map((game) => (
                <Grid item xs={12} sm={6} md={4} key={game.id}>
                  <GameCard 
                    game={game} 
                    onClick={handleGameClick}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default GamesList;