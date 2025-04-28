import React from 'react';
import { Box, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Line } from 'react-chartjs-2';

// Import our React Query hooks
import { usePlayers } from '../../../hooks/usePlayers';

// Import chart.js components if not already registered
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const PlayerStatsWidget = ({ settings, onSettingsChange }) => {
  const { timeframe = 'week', showNewPlayers = true, showActivePlayersChart = true } = settings || {};
  
  // Fetch player data using our React Query hook
  const { data: players, isLoading, error } = usePlayers();
  
  // Handlers for settings changes
  const handleTimeframeChange = (event) => {
    onSettingsChange({ ...settings, timeframe: event.target.value });
  };
  
  // Calculate statistics based on player data
  const calculateStats = () => {
    if (!players || players.length === 0) {
      return {
        total: 0,
        active: 0,
        newPlayers: 0,
        activeTrend: [],
        newTrend: []
      };
    }
    
    // Get current date for comparison
    const now = new Date();
    const timeframeDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    
    // Calculate active players (with activity in the selected timeframe)
    const active = players.filter(player => {
      if (!player.lastLogin) return false;
      const lastLogin = new Date(player.lastLogin);
      const diffTime = Math.abs(now - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= timeframeDays;
    }).length;
    
    // Calculate new players (registered in the selected timeframe)
    const newPlayers = players.filter(player => {
      if (!player.registrationDate) return false;
      const regDate = new Date(player.registrationDate);
      const diffTime = Math.abs(now - regDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= timeframeDays;
    }).length;
    
    // Generate trend data (dummy data for now - in real app would come from API)
    const labels = timeframe === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : Array.from({ length: timeframeDays }, (_, i) => i + 1);
    
    const activeTrend = {
      labels,
      datasets: [
        {
          label: 'Active Players',
          data: Array.from({ length: labels.length }, () => Math.floor(Math.random() * active)),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }
      ]
    };
    
    const newTrend = {
      labels,
      datasets: [
        {
          label: 'New Registrations',
          data: Array.from({ length: labels.length }, () => Math.floor(Math.random() * newPlayers / 3)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
    
    return {
      total: players.length,
      active,
      newPlayers,
      activeTrend,
      newTrend
    };
  };
  
  const stats = calculateStats();
  
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
        <Typography color="error">Error loading player data: {error.message}</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={handleTimeframeChange}
            size="small"
          >
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="quarter">Quarter</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Stats Summary */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        mb={3}
        sx={{
          '& .stat-box': {
            flex: 1,
            padding: 2,
            textAlign: 'center',
            borderRadius: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            mr: 2,
            '&:last-child': {
              mr: 0
            }
          }
        }}
      >
        <Box className="stat-box">
          <Typography variant="subtitle2" color="textSecondary">Total Players</Typography>
          <Typography variant="h4">{stats.total}</Typography>
        </Box>
        
        <Box className="stat-box">
          <Typography variant="subtitle2" color="textSecondary">Active Players</Typography>
          <Typography variant="h4">{stats.active}</Typography>
        </Box>
        
        {showNewPlayers && (
          <Box className="stat-box">
            <Typography variant="subtitle2" color="textSecondary">New Players</Typography>
            <Typography variant="h4">{stats.newPlayers}</Typography>
          </Box>
        )}
      </Box>
      
      {/* Player Activity Chart */}
      {showActivePlayersChart && (
        <Box height={200} mt={2}>
          <Typography variant="subtitle2" gutterBottom>Player Activity</Typography>
          <Line 
            data={stats.activeTrend}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  display: false
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
      )}
    </Box>
  );
};

export default PlayerStatsWidget;