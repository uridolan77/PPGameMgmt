import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import { usePlayers } from '../../../hooks/usePlayers';

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PlayerSegmentsWidget = ({ settings, onSettingsChange }) => {
  const { chartType = 'pie' } = settings || {};
  
  // Fetch players data using our React Query hook
  const { data: players, isLoading, error } = usePlayers();
  
  // Handler for chart type change
  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      onSettingsChange({ ...settings, chartType: newChartType });
    }
  };
  
  // Calculate statistics based on players data
  const calculateStats = () => {
    if (!players || players.length === 0) {
      return {
        segments: {},
        chartData: {
          labels: [],
          datasets: []
        }
      };
    }
    
    // Group players by segment
    const segmentCounts = players.reduce((acc, player) => {
      const segment = player.segment || 'Unknown';
      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {});
    
    // Define colors for each segment
    const segmentColors = {
      'VIP': 'rgba(255, 99, 132, 0.7)',
      'High Roller': 'rgba(54, 162, 235, 0.7)',
      'Regular': 'rgba(255, 206, 86, 0.7)',
      'Casual': 'rgba(75, 192, 192, 0.7)',
      'Inactive': 'rgba(153, 102, 255, 0.7)',
      'New': 'rgba(255, 159, 64, 0.7)',
      'Unknown': 'rgba(201, 203, 207, 0.7)'
    };
    
    // Prepare data for charts
    const labels = Object.keys(segmentCounts);
    const data = Object.values(segmentCounts);
    const backgroundColor = labels.map(segment => segmentColors[segment] || 'rgba(201, 203, 207, 0.7)');
    const borderColor = backgroundColor.map(color => color.replace('0.7', '1'));
    
    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1
        }
      ]
    };
    
    return {
      segments: segmentCounts,
      chartData
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
  
  const totalPlayers = players?.length || 0;
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2">
          Total Players: <strong>{totalPlayers}</strong>
        </Typography>
        
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="pie">Pie</ToggleButton>
          <ToggleButton value="bar">Bar</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Chart */}
      <Box sx={{ height: 240, display: 'flex', justifyContent: 'center' }}>
        {stats.chartData.labels.length > 0 ? (
          chartType === 'pie' ? (
            <Pie 
              data={stats.chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 15,
                      font: {
                        size: 11
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = ((value / totalPlayers) * 100).toFixed(1);
                        return `${label}: ${value} players (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <Bar 
              data={{
                ...stats.chartData,
                datasets: [
                  {
                    ...stats.chartData.datasets[0],
                    label: 'Players'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        const percentage = ((value / totalPlayers) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>No player segments to display</Typography>
          </Box>
        )}
      </Box>
      
      {/* Segment Details */}
      <Box mt={3}>
        <Typography variant="subtitle2" gutterBottom>Segment Distribution</Typography>
        <Box 
          display="flex" 
          flexWrap="wrap" 
          gap={1} 
          sx={{
            '& .segment-box': {
              minWidth: 100,
              flex: '1 0 auto',
              padding: 1,
              borderRadius: 1,
              textAlign: 'center'
            }
          }}
        >
          {Object.entries(stats.segments).map(([segment, count]) => {
            const percentage = ((count / totalPlayers) * 100).toFixed(1);
            return (
              <Box 
                key={segment} 
                className="segment-box"
                sx={{ 
                  backgroundColor: stats.chartData.datasets[0].backgroundColor[
                    stats.chartData.labels.findIndex(label => label === segment)
                  ] 
                }}
              >
                <Typography variant="body2" fontWeight="bold">{segment}</Typography>
                <Typography variant="body2">{count} ({percentage}%)</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerSegmentsWidget;