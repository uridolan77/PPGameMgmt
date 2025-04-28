import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Casino as CasinoIcon,
  CardGiftcard as BonusIcon,
  Refresh as RefreshIcon,
  Login as LoginIcon,
  VideoGameAsset as GamePlayIcon,
  StarRate as BonusClaimIcon,
  Payment as DepositIcon,
  MoneyOff as WithdrawalIcon
} from '@mui/icons-material';
import { format, subHours, subDays } from 'date-fns';
import useUiStore from '../../../stores/uiStore';

const ACTIVITY_TYPES = {
  'login': { label: 'Login', icon: <LoginIcon color="primary" />, color: 'default' },
  'game-play': { label: 'Game Play', icon: <GamePlayIcon color="success" />, color: 'success' },
  'bonus-claim': { label: 'Bonus Claim', icon: <BonusClaimIcon color="secondary" />, color: 'secondary' },
  'deposit': { label: 'Deposit', icon: <DepositIcon color="info" />, color: 'info' },
  'withdrawal': { label: 'Withdrawal', icon: <WithdrawalIcon color="warning" />, color: 'warning' }
};

const RecentActivityWidget = ({ settings, onSettingsChange }) => {
  const { limit = 10, types = ['login', 'game-play', 'bonus-claim'] } = settings || {};
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Here we would normally fetch activity data with a React Query hook
  // For this example, we'll generate mock data
  const generateMockActivities = () => {
    const now = new Date();
    const activities = [];
    const activityTypes = Object.keys(ACTIVITY_TYPES);
    
    // Generate random activities
    for (let i = 0; i < 20; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const timeOffset = Math.floor(Math.random() * 72); // Up to 72 hours ago
      const randomHours = Math.floor(Math.random() * 24);
      const timestamp = subHours(now, timeOffset);
      
      activities.push({
        id: `activity-${i}`,
        type,
        playerId: `player-${Math.floor(Math.random() * 100)}`,
        playerName: `Player ${Math.floor(Math.random() * 100)}`,
        details: getActivityDetails(type),
        timestamp
      });
    }
    
    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  };
  
  const getActivityDetails = (type) => {
    switch (type) {
      case 'login':
        return 'Logged in from web client';
      case 'game-play':
        const games = ['Mega Fortune', 'Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Dead or Alive'];
        return `Played ${games[Math.floor(Math.random() * games.length)]}`;
      case 'bonus-claim':
        const bonuses = ['Welcome Bonus', 'Free Spins', 'Reload Bonus', 'Cashback', 'VIP Bonus'];
        return `Claimed ${bonuses[Math.floor(Math.random() * bonuses.length)]}`;
      case 'deposit':
        return `Deposited $${Math.floor(Math.random() * 500)}`;
      case 'withdrawal':
        return `Withdrew $${Math.floor(Math.random() * 1000)}`;
      default:
        return '';
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsRefreshing(false);
      // In a real app, we would trigger a refetch of the data here
    }, 1000);
  };
  
  const handleLimitChange = (event) => {
    onSettingsChange({ ...settings, limit: parseInt(event.target.value) });
  };
  
  const handleTypeToggle = (type) => {
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    // Ensure at least one type is selected
    if (newTypes.length > 0) {
      onSettingsChange({ ...settings, types: newTypes });
    }
  };
  
  // Simulate loading with React Query
  const isLoading = false;
  const error = null;
  const activities = generateMockActivities();
  
  // Filter activities based on selected types and limit
  const filteredActivities = activities
    .filter(activity => types.includes(activity.type))
    .slice(0, limit);
  
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffHours = Math.round((now - timestamp) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
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
        <Typography color="error">Error loading activity data: {error.message}</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Widget Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={1}>
          {Object.entries(ACTIVITY_TYPES).map(([type, { label, color }]) => (
            <Chip 
              key={type}
              label={label}
              color={types.includes(type) ? color : 'default'}
              variant={types.includes(type) ? 'filled' : 'outlined'}
              size="small"
              onClick={() => handleTypeToggle(type)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <FormControl size="small" sx={{ width: 80 }}>
            <InputLabel>Show</InputLabel>
            <Select
              value={limit}
              label="Show"
              onChange={handleLimitChange}
              size="small"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton 
            onClick={handleRefresh} 
            size="small" 
            disabled={isRefreshing}
          >
            <RefreshIcon fontSize="small" sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Box>
      </Box>
      
      {/* Activity List */}
      <List sx={{ maxHeight: 320, overflow: 'auto' }}>
        {filteredActivities.map((activity, index) => {
          const { icon } = ACTIVITY_TYPES[activity.type];
          
          return (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.default' }}>
                    {icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="500">
                        {activity.playerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {activity.details}
                    </Typography>
                  }
                />
              </ListItem>
              {index < filteredActivities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
        {filteredActivities.length === 0 && (
          <ListItem>
            <ListItemText primary="No activities to display" />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default RecentActivityWidget;