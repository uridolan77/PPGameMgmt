import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Rating
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Import our React Query hooks
import { useGames } from '../../../hooks/useGames';
import useUiStore from '../../../stores/uiStore';

const TopGamesWidget = ({ settings, onSettingsChange }) => {
  const { sortBy = 'popularity', timeframe = 'week', limit = 5 } = settings || {};
  
  // Fetch games data using our React Query hook
  const { data: games, isLoading, error } = useGames();
  
  // Get navigateToRoute function from our Zustand store
  const navigateToRoute = useUiStore(state => state.navigateToRoute);
  
  // Handlers for settings changes
  const handleSortByChange = (event) => {
    onSettingsChange({ ...settings, sortBy: event.target.value });
  };
  
  const handleTimeframeChange = (event) => {
    onSettingsChange({ ...settings, timeframe: event.target.value });
  };
  
  const handleLimitChange = (event) => {
    onSettingsChange({ ...settings, limit: parseInt(event.target.value) });
  };
  
  // Generate top games based on sort criteria
  const generateTopGames = () => {
    if (!games || games.length === 0) {
      return [];
    }
    
    // In a real app, this would come from analytics data
    // Here, we'll generate mock metrics for each game
    const gamesWithMetrics = games.map(game => {
      return {
        ...game,
        popularity: Math.floor(Math.random() * 100),
        revenue: Math.floor(Math.random() * 10000) + 500,
        playerCount: Math.floor(Math.random() * 5000) + 100,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3-5 stars
        trend: Math.floor(Math.random() * 200) - 100 // -100% to +100%
      };
    });
    
    // Sort by the selected metric
    let sortedGames;
    
    if (sortBy === 'popularity') {
      sortedGames = [...gamesWithMetrics].sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === 'revenue') {
      sortedGames = [...gamesWithMetrics].sort((a, b) => b.revenue - a.revenue);
    } else if (sortBy === 'players') {
      sortedGames = [...gamesWithMetrics].sort((a, b) => b.playerCount - a.playerCount);
    } else if (sortBy === 'rating') {
      sortedGames = [...gamesWithMetrics].sort((a, b) => b.rating - a.rating);
    } else {
      // Default to popularity
      sortedGames = [...gamesWithMetrics].sort((a, b) => b.popularity - a.popularity);
    }
    
    return sortedGames.slice(0, limit);
  };
  
  const topGames = generateTopGames();
  
  // Handler for game click
  const handleGameClick = (gameId) => {
    navigateToRoute(`/games/${gameId}`);
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Typography color="error">Error loading games: {error.message}</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortByChange}
            size="small"
          >
            <MenuItem value="popularity">Popularity</MenuItem>
            <MenuItem value="revenue">Revenue</MenuItem>
            <MenuItem value="players">Player Count</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
        </FormControl>
        
        <Box display="flex" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 100, mr: 2 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
              size="small"
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ width: 80 }}>
            <InputLabel>Show</InputLabel>
            <Select
              value={limit}
              label="Show"
              onChange={handleLimitChange}
              size="small"
            >
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Games Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Game</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="right">
                {sortBy === 'popularity' ? 'Popularity' :
                 sortBy === 'revenue' ? 'Revenue' :
                 sortBy === 'players' ? 'Players' : 'Rating'}
              </TableCell>
              <TableCell align="right">Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topGames.map((game) => (
              <TableRow 
                key={game.id} 
                hover 
                onClick={() => handleGameClick(game.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center">
                    <CasinoIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">{game.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={game.category || 'Slot'} 
                    size="small" 
                    color={game.category === 'Slots' ? 'primary' : 
                           game.category === 'Table' ? 'secondary' : 
                           'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  {sortBy === 'rating' ? (
                    <Box display="flex" justifyContent="flex-end">
                      <Rating value={game.rating} precision={0.5} size="small" readOnly />
                    </Box>
                  ) : (
                    <Typography variant="body2" fontWeight="bold">
                      {sortBy === 'popularity' ? `${game.popularity}%` :
                       sortBy === 'revenue' ? `$${game.revenue.toLocaleString()}` :
                       `${game.playerCount.toLocaleString()}`}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    {game.trend > 0 ? (
                      <>
                        <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                        <Typography variant="caption" color="success.main">+{game.trend}%</Typography>
                      </>
                    ) : game.trend < 0 ? (
                      <>
                        <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                        <Typography variant="caption" color="error.main">{game.trend}%</Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">0%</Typography>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {topGames.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No games available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Insight */}
      <Box mt={2}>
        <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          {timeframe === 'day' ? 'Today\'s data compared to yesterday' : 
           timeframe === 'week' ? 'This week\'s data compared to last week' :
           'This month\'s data compared to last month'}
        </Typography>
      </Box>
    </Box>
  );
};

export default TopGamesWidget;