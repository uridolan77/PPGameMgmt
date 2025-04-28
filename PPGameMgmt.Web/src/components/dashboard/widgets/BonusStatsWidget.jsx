import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip as RechartsTooltip
} from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Import our React Query hooks
import { useBonuses } from '../../../hooks/useBonuses';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const BonusStatsWidget = ({ settings, onSettingsChange }) => {
  const { timeframe = 'month', bonusType = 'all' } = settings || {};
  
  // Fetch bonuses data using our React Query hook
  const { data: bonuses, isLoading, error } = useBonuses();
  
  // Handlers for settings changes
  const handleTimeframeChange = (event) => {
    onSettingsChange({ ...settings, timeframe: event.target.value });
  };
  
  const handleBonusTypeChange = (event) => {
    onSettingsChange({ ...settings, bonusType: event.target.value });
  };
  
  // Generate bonus stats
  const bonusStats = useMemo(() => {
    if (!bonuses || bonuses.length === 0) {
      return {
        totalBonuses: 0,
        claimedBonuses: 0,
        claimRate: 0,
        totalValue: 0,
        avgValue: 0,
        conversionRate: 0,
        roi: 0,
        typeDistribution: [],
        statusDistribution: []
      };
    }
    
    // Filter bonuses by type if needed
    const filteredBonuses = bonusType === 'all' ? 
      bonuses : 
      bonuses.filter(bonus => bonus.type === bonusType);
    
    // In a real app, these would come from analytics data
    // Here, we'll generate mock stats
    
    const totalBonuses = filteredBonuses.length;
    const claimedBonuses = Math.floor(totalBonuses * (Math.random() * 0.4 + 0.3)); // 30-70% claimed
    const claimRate = Math.round((claimedBonuses / totalBonuses) * 100);
    
    // Total and average bonus value
    let totalValue = 0;
    filteredBonuses.forEach(bonus => {
      totalValue += bonus.value || Math.floor(Math.random() * 50) + 5;
    });
    
    const avgValue = Math.round(totalValue / totalBonuses);
    
    // Conversion rate - percentage of claimed bonuses that led to bets
    const conversionRate = Math.round(Math.random() * 40 + 50); // 50-90%
    
    // Return on investment - for every $1 in bonuses, how much comes back in bets
    const roi = Math.round((Math.random() * 3 + 1.5) * 10) / 10; // $1.5-$4.5
    
    // Group bonuses by type
    const bonusesByType = {};
    filteredBonuses.forEach(bonus => {
      const type = bonus.type || 'Welcome';
      bonusesByType[type] = (bonusesByType[type] || 0) + 1;
    });
    
    const typeDistribution = Object.entries(bonusesByType).map(([name, value]) => ({
      name,
      value
    }));
    
    // Status distribution
    const statusDistribution = [
      { name: 'Claimed', value: claimedBonuses },
      { name: 'Unclaimed', value: totalBonuses - claimedBonuses }
    ];
    
    return {
      totalBonuses,
      claimedBonuses,
      claimRate,
      totalValue,
      avgValue,
      conversionRate,
      roi,
      typeDistribution,
      statusDistribution
    };
  }, [bonuses, bonusType]);
  
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
  
  // Determine unique bonus types for filter
  const bonusTypes = bonuses ? 
    ['all', ...new Set(bonuses.map(bonus => bonus.type).filter(Boolean))] : 
    ['all', 'Welcome', 'Deposit', 'Free Spins', 'Loyalty'];
  
  return (
    <Box>
      {/* Widget Settings */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Bonus Type</InputLabel>
          <Select
            value={bonusType}
            label="Bonus Type"
            onChange={handleBonusTypeChange}
            size="small"
          >
            {bonusTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
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
                Claim Rate
              </Typography>
              <Typography variant="h5">
                {bonusStats.claimRate}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {bonusStats.claimedBonuses} of {bonusStats.totalBonuses} bonuses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom display="flex" alignItems="center">
                Conversion
                <Tooltip title="Percentage of claimed bonuses that led to wagers">
                  <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: 16 }} />
                </Tooltip>
              </Typography>
              <Typography variant="h5">
                {bonusStats.conversionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom display="flex" alignItems="center">
                ROI
                <Tooltip title="Return on Investment - for every $1 in bonuses, amount returned in bets">
                  <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: 16 }} />
                </Tooltip>
              </Typography>
              <Typography variant="h5">
                ${bonusStats.roi}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={2}>
        {/* Bonus Type Distribution */}
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom align="center">
            Bonus Type Distribution
          </Typography>
          <Box sx={{ height: 180, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bonusStats.typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {bonusStats.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} bonuses`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        {/* Bonus Status Distribution */}
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom align="center">
            Bonus Status
          </Typography>
          <Box sx={{ height: 180, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bonusStats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill="#4caf50" /> {/* Claimed */}
                  <Cell fill="#f44336" /> {/* Unclaimed */}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} bonuses (${Math.round(value/bonusStats.totalBonuses*100)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
      
      {/* Metrics Table */}
      <Box mt={2}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          Bonus Value Metrics
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">
            Total Bonus Value:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            ${bonusStats.totalValue.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2">
            Average Bonus Value:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            ${bonusStats.avgValue.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2">
            Estimated Return:
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            ${(bonusStats.totalValue * bonusStats.roi).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BonusStatsWidget;