import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { Bar } from 'react-chartjs-2';

// Import our React Query hooks
import { useGames } from '../../../hooks/useGames';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GameStatsWidget = ({ settings, onSettingsChange }) => {
  const { timeframe = 'day', gameType = 'all' } = settings || {};
  
  // Fetch games data using our React Query hook
  const { data: games, isLoading, error } = useGames();
  
  // Handlers for settings changes
  const handleTimeframeChange = (event) => {
    onSettingsChange({ ...settings, timeframe: event.target.value });
  };
  
  const handleGameTypeChange = (event) => {
    onSettingsChange({ ...settings, gameType: event.target.value });
  };
  
  // Generate game stats data
  const generateGameStats = () => {
    if (!games || games.length === 0) {
      return {
        totalSessions: 0,
        totalPlayers: 0,
        avgSessionTime: 0,
        avgBetAmount: 0,
        avgPayout: 0,
        topGames: [],
        chartData: {
          labels: [],
          datasets: []
        }
      };
    }
    
    // Filter games by type if needed
    const filteredGames = gameType === 'all' ? 
      games : 
      games.filter(game => game.category === gameType);
    
    // In a real app, these would come from analytics data
    // Here, we'll generate mock stats
    
    // Calculate total sessions and players (mock data)
    const totalSessions = Math.floor(Math.random() * 10000) + 5000;
    const totalPlayers = Math.floor(totalSessions * (0.5 + Math.random() * 0.4)); // 50-90% of sessions
    
    // Average session time in minutes
    const avgSessionTime = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
    
    // Average bet amount
    const avgBetAmount = Math.round((Math.random() * 20) + 5); // $5-25
    
    // Average payout percentage
    const avgPayout = Math.round((Math.random() * 10) + 90); // 90-100%
    
    // Generate top 5 games by play count
    const topGames = [...filteredGames]
      .sort(() => Math.random() - 0.5) // Shuffle for mock data
      .slice(0, 5)
      .map(game => ({
        ...game,
        playCount: Math.floor(Math.random() * 1000) + 100,
        popularity: Math.floor(Math.random() * 100)
      }))
      .sort((a, b) => b.playCount - a.playCount);
    
    // Prepare chart data
    let labels;
    if (timeframe === 'day') {
      labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
    } else if (timeframe === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else {
      // month
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    }
    
    // Generate mock session data based on timeframe
    const sessionCounts = labels.map(() => Math.floor(Math.random() * 1000) + 200);
    const uniquePlayers = sessionCounts.map(count => Math.floor(count * (0.5 + Math.random() * 0.4)));
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Game Sessions',
          data: sessionCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Unique Players',
          data: uniquePlayers,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
    
    return {
      totalSessions,
      totalPlayers,
      avgSessionTime,
      avgBetAmount,
      avgPayout,
      topGames,
      chartData
    };
  };
  
  const stats = generateGameStats();
  
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
        <Typography color="error">Error loading game data: {error.message}</Typography>
      </Box>
    );
  }
  
  // Determine unique game categories for filter
  const gameCategories = games ? 
    ['all', ...new Set(games.map(game => game.category).filter(Boolean))] : 
    ['all'];
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Game Type</InputLabel>
          <Select
            value={gameType}
            label="Game Type"
            onChange={handleGameTypeChange}
            size="small"
          >
            {gameCategories.map(category => (
              <MenuItem key={category} value={category}>
                {category === 'all' ? 'All Types' : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
      </Box>
      
      {/* Summary Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Sessions
              </Typography>
              <Typography variant="h5">
                {stats.totalSessions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Players
              </Typography>
              <Typography variant="h5">
                {stats.totalPlayers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Avg. Session
              </Typography>
              <Typography variant="h5">
                {stats.avgSessionTime} min
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Chart */}
      <Box sx={{ height: 200, mb: 3 }}>
        <Bar 
          data={stats.chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  boxWidth: 10,
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </Box>
      
      {/* Top Games */}
      <Typography variant="subtitle2" mb={1}>Top Games by Play Count</Typography>
      <Stack spacing={1}>
        {stats.topGames.map((game, index) => {
          const maxPlayCount = Math.max(...stats.topGames.map(g => g.playCount));
          const progressValue = (game.playCount / maxPlayCount) * 100;
          
          return (
            <Box key={game.id}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  {index + 1}. {game.name}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {game.playCount.toLocaleString()}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                sx={{ 
                  height: 6, 
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: index === 0 ? 'success.main' : 
                                    index === 1 ? 'primary.main' : 
                                    'primary.light'
                  }
                }} 
              />
            </Box>
          );
        })}
        {stats.topGames.length === 0 && (
          <Typography variant="body2" color="textSecondary" align="center">
            No game data available
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default GameStatsWidget;