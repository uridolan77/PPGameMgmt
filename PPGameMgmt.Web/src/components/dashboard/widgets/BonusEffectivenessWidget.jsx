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
  LinearProgress
} from '@mui/material';

// Import our React Query hooks
import { useBonuses } from '../../../hooks/useBonuses';

const BonusEffectivenessWidget = ({ settings, onSettingsChange }) => {
  const { timeframe = 'month', sortBy = 'roi' } = settings || {};
  
  // Fetch bonuses data using our React Query hook
  const { data: bonuses, isLoading, error } = useBonuses();
  
  // Handlers for settings changes
  const handleTimeframeChange = (event) => {
    onSettingsChange({ ...settings, timeframe: event.target.value });
  };
  
  const handleSortByChange = (event) => {
    onSettingsChange({ ...settings, sortBy: event.target.value });
  };
  
  // Calculate analytics based on bonuses data
  const calculateAnalytics = () => {
    if (!bonuses || bonuses.length === 0) {
      return {
        bonusMetrics: [],
        totalClaims: 0,
        totalCost: 0,
        averageRoi: 0
      };
    }
    
    // In a real app, this would come from analytics data
    // Here, we'll generate mock metrics for each bonus
    const bonusMetrics = bonuses.map(bonus => {
      const claimCount = Math.floor(Math.random() * 500);
      const cost = bonus.value * claimCount;
      const revenue = cost * (1 + (Math.random() * 3)); // Revenue is 1-4x cost
      const roi = ((revenue - cost) / cost) * 100;
      const conversionRate = Math.random() * 50; // 0-50% conversion
      
      return {
        ...bonus,
        claimCount,
        cost,
        revenue,
        roi: Math.round(roi * 100) / 100, // Format to 2 decimal places
        conversionRate: Math.round(conversionRate * 100) / 100 // Format to 2 decimal places
      };
    });
    
    // Sort by the selected metric
    const sortedMetrics = [...bonusMetrics].sort((a, b) => {
      if (sortBy === 'roi') {
        return b.roi - a.roi;
      } else if (sortBy === 'claimCount') {
        return b.claimCount - a.claimCount;
      } else if (sortBy === 'conversionRate') {
        return b.conversionRate - a.conversionRate;
      }
      return b.roi - a.roi; // Default sort by ROI
    });
    
    // Calculate totals and averages
    const totalClaims = bonusMetrics.reduce((sum, bonus) => sum + bonus.claimCount, 0);
    const totalCost = bonusMetrics.reduce((sum, bonus) => sum + bonus.cost, 0);
    const totalRevenue = bonusMetrics.reduce((sum, bonus) => sum + bonus.revenue, 0);
    const averageRoi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    
    return {
      bonusMetrics: sortedMetrics,
      totalClaims,
      totalCost,
      averageRoi: Math.round(averageRoi * 100) / 100
    };
  };
  
  const analytics = calculateAnalytics();
  
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
        <Typography color="error">Error loading bonus data: {error.message}</Typography>
      </Box>
    );
  }
  
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
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortByChange}
            size="small"
          >
            <MenuItem value="roi">ROI</MenuItem>
            <MenuItem value="claimCount">Claim Count</MenuItem>
            <MenuItem value="conversionRate">Conversion Rate</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Summary Stats */}
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
          <Typography variant="subtitle2" color="textSecondary">Total Claims</Typography>
          <Typography variant="h5">{analytics.totalClaims.toLocaleString()}</Typography>
        </Box>
        
        <Box className="stat-box">
          <Typography variant="subtitle2" color="textSecondary">Total Cost</Typography>
          <Typography variant="h5">${analytics.totalCost.toLocaleString()}</Typography>
        </Box>
        
        <Box className="stat-box">
          <Typography variant="subtitle2" color="textSecondary">Average ROI</Typography>
          <Typography 
            variant="h5" 
            color={analytics.averageRoi >= 0 ? 'success.main' : 'error.main'}
          >
            {analytics.averageRoi}%
          </Typography>
        </Box>
      </Box>
      
      {/* Bonus Metrics Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Bonus</TableCell>
              <TableCell align="right">Type</TableCell>
              <TableCell align="right">
                {sortBy === 'roi' ? (
                  <Typography fontWeight="bold">ROI (%)</Typography>
                ) : sortBy === 'claimCount' ? (
                  <Typography fontWeight="bold">Claims</Typography>
                ) : (
                  <Typography fontWeight="bold">Conversion (%)</Typography>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.bonusMetrics.slice(0, 5).map((bonus) => {
              // Determine progress color based on ROI
              let progressColor = 'primary';
              if (bonus.roi > 100) progressColor = 'success';
              else if (bonus.roi < 0) progressColor = 'error';
              
              // Normalize value for progress bar
              let normalizedValue;
              if (sortBy === 'roi') {
                normalizedValue = Math.max(0, Math.min(100, bonus.roi));
              } else if (sortBy === 'claimCount') {
                const maxClaims = Math.max(...analytics.bonusMetrics.map(b => b.claimCount));
                normalizedValue = (bonus.claimCount / maxClaims) * 100;
              } else {
                normalizedValue = bonus.conversionRate;
              }
              
              return (
                <TableRow key={bonus.id} hover>
                  <TableCell component="th" scope="row">
                    {bonus.name}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {timeframe === 'week' ? 'This week' : 
                       timeframe === 'month' ? 'This month' : 
                       timeframe === 'quarter' ? 'This quarter' : 'This year'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={bonus.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Box sx={{ width: '100%', mr: 1, maxWidth: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={normalizedValue} 
                          color={progressColor}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 50 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {sortBy === 'roi' ? `${bonus.roi}%` : 
                           sortBy === 'claimCount' ? bonus.claimCount : 
                           `${bonus.conversionRate}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {analytics.bonusMetrics.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No bonus data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BonusEffectivenessWidget;