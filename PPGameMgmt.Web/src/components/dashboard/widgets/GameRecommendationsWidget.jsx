import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Rating
} from '@mui/material';

// Import our recommendations React Query hook
import { useGameRecommendations } from '../../../hooks/useRecommendations';
import { usePlayers } from '../../../hooks/usePlayers';
import useUiStore from '../../../stores/uiStore';

const GameRecommendationsWidget = ({ settings, onSettingsChange }) => {
  const { playerSegment = 'all', limit = 5 } = settings || {};
  
  // Fetch players data for segment selection
  const { data: players, isLoading: isLoadingPlayers } = usePlayers();
  
  // Get mock recommendations based on segment
  // In a real application, we would use the useGameRecommendations hook with a playerId
  // For this widget, we'll generate mock recommendations
  const isLoading = isLoadingPlayers;
  const error = null;
  
  // Handlers for settings changes
  const handleSegmentChange = (event) => {
    onSettingsChange({ ...settings, playerSegment: event.target.value });
  };
  
  const handleLimitChange = (event) => {
    onSettingsChange({ ...settings, limit: parseInt(event.target.value) });
  };
  
  // Generate mock game recommendations
  const generateMockRecommendations = () => {
    if (!players || players.length === 0) return [];
    
    // Array of dummy games with images and details
    const dummyGames = [
      {
        id: 'game-1',
        name: 'Starburst',
        type: 'Slot',
        provider: 'NetEnt',
        rating: 4.8,
        relevanceScore: 98,
        imageUrl: 'https://via.placeholder.com/120x80?text=Starburst',
        tags: ['Popular', 'Free Spins']
      },
      {
        id: 'game-2',
        name: 'Gonzo\'s Quest',
        type: 'Slot',
        provider: 'NetEnt',
        rating: 4.7,
        relevanceScore: 96,
        imageUrl: 'https://via.placeholder.com/120x80?text=Gonzo',
        tags: ['Adventure', 'Multipliers']
      },
      {
        id: 'game-3',
        name: 'Book of Dead',
        type: 'Slot',
        provider: 'Play\'n GO',
        rating: 4.6,
        relevanceScore: 94,
        imageUrl: 'https://via.placeholder.com/120x80?text=Book+of+Dead',
        tags: ['Egypt', 'Free Spins']
      },
      {
        id: 'game-4',
        name: 'Blackjack',
        type: 'Table',
        provider: 'Evolution Gaming',
        rating: 4.9,
        relevanceScore: 95,
        imageUrl: 'https://via.placeholder.com/120x80?text=Blackjack',
        tags: ['Card', 'Strategy']
      },
      {
        id: 'game-5',
        name: 'Mega Fortune',
        type: 'Jackpot',
        provider: 'NetEnt',
        rating: 4.5,
        relevanceScore: 92,
        imageUrl: 'https://via.placeholder.com/120x80?text=Mega+Fortune',
        tags: ['Progressive', 'Luxury']
      },
      {
        id: 'game-6',
        name: 'Dead or Alive 2',
        type: 'Slot',
        provider: 'NetEnt',
        rating: 4.7,
        relevanceScore: 93,
        imageUrl: 'https://via.placeholder.com/120x80?text=DoA2',
        tags: ['Western', 'High Volatility']
      },
      {
        id: 'game-7',
        name: 'Roulette',
        type: 'Table',
        provider: 'Evolution Gaming',
        rating: 4.8,
        relevanceScore: 91,
        imageUrl: 'https://via.placeholder.com/120x80?text=Roulette',
        tags: ['Classic', 'Easy to Play']
      },
      {
        id: 'game-8',
        name: 'Reactoonz',
        type: 'Slot',
        provider: 'Play\'n GO',
        rating: 4.6,
        relevanceScore: 90,
        imageUrl: 'https://via.placeholder.com/120x80?text=Reactoonz',
        tags: ['Cluster Pays', 'Cascading']
      }
    ];
    
    // Modify recommendations based on segment
    if (playerSegment !== 'all') {
      // Simulate different recommendations for different segments
      // In a real app, this would come from your recommendation engine
      const segmentPreferences = {
        'VIP': ['Jackpot', 'Table'],
        'High Roller': ['Table', 'High Volatility'],
        'Regular': ['Slot', 'Popular'],
        'Casual': ['Easy to Play', 'Low Volatility'],
        'New': ['Popular', 'Free Spins'],
        'Inactive': ['New', 'Bonus Features']
      };
      
      const preferences = segmentPreferences[playerSegment] || [];
      
      // Boost relevance score of games matching segment preferences
      return dummyGames
        .map(game => {
          let boostScore = 0;
          
          // Check if game type or tags match preferences
          if (preferences.includes(game.type)) boostScore += 5;
          game.tags.forEach(tag => {
            if (preferences.includes(tag)) boostScore += 3;
          });
          
          return {
            ...game,
            relevanceScore: Math.min(100, game.relevanceScore + boostScore)
          };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    }
    
    // For "all" segment, just sort by relevance score and return top N
    return dummyGames
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  };
  
  const recommendations = generateMockRecommendations();
  
  // Extract unique segments from players data
  const segments = players 
    ? ['all', ...new Set(players.map(player => player.segment).filter(Boolean))]
    : ['all'];
  
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
        <Typography color="error">Error loading recommendations: {error.message}</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Segment</InputLabel>
          <Select
            value={playerSegment}
            label="Segment"
            onChange={handleSegmentChange}
            size="small"
          >
            {segments.map(segment => (
              <MenuItem key={segment} value={segment}>
                {segment === 'all' ? 'All Segments' : segment}
              </MenuItem>
            ))}
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
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={8}>8</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <Box>
          <Grid container spacing={1}>
            {recommendations.map((game) => (
              <Grid item xs={12} key={game.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    display: 'flex', 
                    mb: 1,
                    alignItems: 'center'
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 80, height: 60, objectFit: 'cover' }}
                    image={game.imageUrl}
                    alt={game.name}
                  />
                  <CardContent sx={{ flex: '1 1 auto', py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" fontWeight="bold" component="div">
                          {game.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                          {game.provider}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Rating size="small" value={game.rating} precision={0.1} readOnly sx={{ mr: 1 }} />
                          <Typography variant="caption" fontWeight="bold">
                            {game.relevanceScore}% match
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={game.type} 
                        size="small" 
                        color={
                          game.type === 'Slot' ? 'primary' : 
                          game.type === 'Table' ? 'secondary' : 
                          game.type === 'Jackpot' ? 'error' : 
                          'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                      {game.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography>No recommendations available</Typography>
        </Box>
      )}
    </Box>
  );
};

export default GameRecommendationsWidget;