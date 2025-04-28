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
import { Line } from 'react-chartjs-2';

// Import our React Query hooks
import { usePlayers } from '../../../hooks/usePlayers';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  Filler
);

const PlayerRetentionWidget = ({ settings, onSettingsChange }) => {
  const { timeframe = 'month', metricType = 'retention' } = settings || {};
  
  // Fetch players data using our React Query hook
  const { data: players, isLoading, error } = usePlayers();
  
  // Handlers for settings changes
  const handleTimeframeChange = (event) => {
    onSettingsChange({ ...settings, timeframe: event.target.value });
  };
  
  const handleMetricTypeChange = (event, newMetricType) => {
    if (newMetricType !== null) {
      onSettingsChange({ ...settings, metricType: newMetricType });
    }
  };
  
  // Generate retention metrics data
  const generateRetentionData = () => {
    if (!players || players.length === 0) {
      return {
        retentionRate: 0,
        churnRate: 0,
        reactivationRate: 0,
        chartData: {
          labels: [],
          datasets: []
        }
      };
    }
    
    // Generate mock retention metrics based on timeframe
    let labels;
    let dataPoints;
    
    if (timeframe === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      dataPoints = 7;
    } else if (timeframe === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      dataPoints = 30;
    } else if (timeframe === 'quarter') {
      labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (12 - i) * 7);
        return `Week ${i + 1}`;
      });
      dataPoints = 12;
    } else {
      // Year
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      dataPoints = 12;
    }
    
    // Generate random trend data
    const retentionTrend = Array.from(
      { length: dataPoints }, 
      () => Math.round(60 + Math.random() * 25)
    );
    
    const churnTrend = retentionTrend.map(retention => Math.round(100 - retention));
    
    const reactivationTrend = Array.from(
      { length: dataPoints }, 
      () => Math.round(5 + Math.random() * 15)
    );
    
    // Current rates - latest value from trends
    const retentionRate = retentionTrend[retentionTrend.length - 1];
    const churnRate = churnTrend[churnTrend.length - 1];
    const reactivationRate = reactivationTrend[reactivationTrend.length - 1];
    
    // Prepare chart data for the selected metric
    let datasets;
    
    if (metricType === 'retention') {
      datasets = [
        {
          label: 'Retention Rate (%)',
          data: retentionTrend,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          fill: true,
          tension: 0.3
        }
      ];
    } else if (metricType === 'churn') {
      datasets = [
        {
          label: 'Churn Rate (%)',
          data: churnTrend,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
          tension: 0.3
        }
      ];
    } else {
      datasets = [
        {
          label: 'Reactivation Rate (%)',
          data: reactivationTrend,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
          tension: 0.3
        }
      ];
    }
    
    const chartData = {
      labels,
      datasets
    };
    
    return {
      retentionRate,
      churnRate,
      reactivationRate,
      chartData
    };
  };
  
  const metrics = generateRetentionData();
  
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
  
  // Helper function to determine the color for metrics
  const getMetricColor = (metricType, value) => {
    if (metricType === 'retention') {
      return value >= 75 ? 'success.main' : value >= 60 ? 'info.main' : 'warning.main';
    } else if (metricType === 'churn') {
      return value <= 15 ? 'success.main' : value <= 25 ? 'info.main' : 'error.main';
    } else {
      // reactivation
      return value >= 15 ? 'success.main' : value >= 10 ? 'info.main' : 'text.primary';
    }
  };
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>
        
        <ToggleButtonGroup
          value={metricType}
          exclusive
          onChange={handleMetricTypeChange}
          size="small"
        >
          <ToggleButton value="retention">Retention</ToggleButton>
          <ToggleButton value="churn">Churn</ToggleButton>
          <ToggleButton value="reactivation">Reactivation</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Metrics Summary */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        mb={3}
        sx={{
          '& .metric-box': {
            flex: 1,
            padding: 1.5,
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
        <Box className="metric-box">
          <Typography variant="subtitle2" color="textSecondary">Retention Rate</Typography>
          <Typography 
            variant="h5" 
            color={getMetricColor('retention', metrics.retentionRate)}
            fontWeight={metricType === 'retention' ? 'bold' : 'regular'}
          >
            {metrics.retentionRate}%
          </Typography>
        </Box>
        
        <Box className="metric-box">
          <Typography variant="subtitle2" color="textSecondary">Churn Rate</Typography>
          <Typography 
            variant="h5" 
            color={getMetricColor('churn', metrics.churnRate)}
            fontWeight={metricType === 'churn' ? 'bold' : 'regular'}
          >
            {metrics.churnRate}%
          </Typography>
        </Box>
        
        <Box className="metric-box">
          <Typography variant="subtitle2" color="textSecondary">Reactivation</Typography>
          <Typography 
            variant="h5" 
            color={getMetricColor('reactivation', metrics.reactivationRate)}
            fontWeight={metricType === 'reactivation' ? 'bold' : 'regular'}
          >
            {metrics.reactivationRate}%
          </Typography>
        </Box>
      </Box>
      
      {/* Chart */}
      <Box sx={{ height: 200 }}>
        <Line 
          data={metrics.chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            hover: {
              mode: 'nearest',
              intersect: true
            },
            scales: {
              y: {
                beginAtZero: true,
                max: metricType === 'reactivation' ? 30 : 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            }
          }}
        />
      </Box>
      
      {/* Insights */}
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          {metricType === 'retention' ? (
            metrics.retentionRate > 70 ? 
              'Excellent retention rate! Your player engagement strategies are working well.' :
              'Consider implementing loyalty programs to improve player retention.'
          ) : metricType === 'churn' ? (
            metrics.churnRate < 20 ?
              'Low churn rate indicates good player satisfaction and engagement.' :
              'Higher than ideal churn rate. Implement re-engagement campaigns for at-risk players.'
          ) : (
            metrics.reactivationRate > 12 ?
              'Your reactivation campaigns are performing well above industry average.' :
              'Consider targeted bonus offers to improve player reactivation rates.'
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default PlayerRetentionWidget;