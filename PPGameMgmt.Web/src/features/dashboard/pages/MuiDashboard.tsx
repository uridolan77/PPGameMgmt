import React, { useState } from 'react';
import { useStore } from '../../../core/store';
import useAuth from '../../../features/auth/hooks/useAuth';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Button,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  SportsEsports,
  Campaign,
  Timer,
  MoreVert,
  Visibility,
  ArrowUpward,
  ArrowDownward,
  Star,
  StarBorder,
  Refresh,
  Dashboard as DashboardIcon,
  Person,
  Games,
  Notifications
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Mock data for the dashboard
const mockData = {
  stats: {
    totalPlayers: {
      value: 4283,
      change: 12,
      trend: 'up'
    },
    activeGames: {
      value: 186,
      change: 15,
      trend: 'up'
    },
    bonusCampaigns: {
      value: 24,
      change: -3,
      trend: 'down'
    },
    avgSessionTime: {
      value: 18,
      change: 5,
      trend: 'up'
    }
  },
  topGames: [
    { id: 1, name: 'Poker Stars', players: 1245, trend: 'up', change: 8 },
    { id: 2, name: 'Blackjack Pro', players: 986, trend: 'up', change: 5 },
    { id: 3, name: 'Slot Mania', players: 754, trend: 'down', change: 3 },
    { id: 4, name: 'Roulette Master', players: 612, trend: 'up', change: 12 },
    { id: 5, name: 'Baccarat Royal', players: 489, trend: 'down', change: 2 }
  ],
  recentActivity: [
    { id: 1, type: 'player', name: 'John Doe', action: 'joined', target: 'Poker Stars', time: '5 minutes ago' },
    { id: 2, type: 'game', name: 'Blackjack Pro', action: 'reached', target: '1000 players', time: '15 minutes ago' },
    { id: 3, type: 'campaign', name: 'Summer Bonus', action: 'started', target: '', time: '1 hour ago' },
    { id: 4, type: 'player', name: 'Jane Smith', action: 'won', target: '$5000 jackpot', time: '2 hours ago' },
    { id: 5, type: 'game', name: 'Slot Mania', action: 'updated to', target: 'version 2.1', time: '3 hours ago' }
  ],
  playerStats: {
    newPlayers: { value: 156, change: 12 },
    activeUsers: { value: 2845, change: 8 },
    retention: { value: 68, change: 3 },
    churn: { value: 12, change: -2 }
  },
  gamePerformance: [
    { name: 'Poker Stars', performance: 92 },
    { name: 'Blackjack Pro', performance: 85 },
    { name: 'Slot Mania', performance: 78 },
    { name: 'Roulette Master', performance: 72 },
    { name: 'Baccarat Royal', performance: 65 }
  ]
};

// Styled components
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ paddingTop: '24px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const MuiDashboard: React.FC = () => {
  const theme = useTheme();
  const { preferences } = useStore();
  const auth = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Default dashboard widgets if not available in preferences
  const dashboardWidgets = preferences?.dashboardWidgets || ['playerStats', 'gameStats', 'topGames', 'recentActivity'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />;
    } else {
      return <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />;
    }
  };

  const getChangeColor = (trend: string) => {
    return trend === 'up' ? 'success.main' : 'error.main';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'player':
        return <Person sx={{ color: 'primary.main' }} />;
      case 'game':
        return <Games sx={{ color: 'secondary.main' }} />;
      case 'campaign':
        return <Campaign sx={{ color: 'warning.main' }} />;
      default:
        return <Notifications sx={{ color: 'info.main' }} />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {auth.user?.firstName || auth.user?.username || 'User'}! Here's an overview of your platform.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Players
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
                    {formatNumber(mockData.stats.totalPlayers.value)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon('up', mockData.stats.totalPlayers.change)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getChangeColor('up') }}>
                      {mockData.stats.totalPlayers.change}% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', p: 1 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Games
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
                    {formatNumber(mockData.stats.activeGames.value)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon('up', mockData.stats.activeGames.change)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getChangeColor('up') }}>
                      {mockData.stats.activeGames.change} new this week
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light', p: 1 }}>
                  <SportsEsports />
                </Avatar>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bonus Campaigns
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
                    {formatNumber(mockData.stats.bonusCampaigns.value)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon('down', mockData.stats.bonusCampaigns.change)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getChangeColor('down') }}>
                      {Math.abs(mockData.stats.bonusCampaigns.change)} ending soon
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', p: 1 }}>
                  <Campaign />
                </Avatar>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg. Session Time
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
                    {mockData.stats.avgSessionTime.value} min
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon('up', mockData.stats.avgSessionTime.change)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getChangeColor('up') }}>
                      {mockData.stats.avgSessionTime.change}% from last week
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', p: 1 }}>
                  <Timer />
                </Avatar>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary"
          textColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
              fontWeight: 'medium'
            }
          }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            iconPosition="start" 
            label="Overview" 
            id="dashboard-tab-0" 
            aria-controls="dashboard-tabpanel-0" 
          />
          <Tab 
            icon={<Person />} 
            iconPosition="start" 
            label="Players" 
            id="dashboard-tab-1" 
            aria-controls="dashboard-tabpanel-1" 
          />
          <Tab 
            icon={<Games />} 
            iconPosition="start" 
            label="Games" 
            id="dashboard-tab-2" 
            aria-controls="dashboard-tabpanel-2" 
          />
          <Tab 
            icon={<Notifications />} 
            iconPosition="start" 
            label="Activities" 
            id="dashboard-tab-3" 
            aria-controls="dashboard-tabpanel-3" 
          />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {dashboardWidgets.includes('playerStats') && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Player Statistics" 
                    action={
                      <IconButton aria-label="refresh">
                        <Refresh />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">New Players</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" color="success.main" sx={{ mr: 0.5 }}>
                                +{mockData.playerStats.newPlayers.change}%
                              </Typography>
                              <ArrowUpward fontSize="small" color="success" />
                            </Box>
                          </Box>
                          <Typography variant="h6">{mockData.playerStats.newPlayers.value}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Active Users</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" color="success.main" sx={{ mr: 0.5 }}>
                                +{mockData.playerStats.activeUsers.change}%
                              </Typography>
                              <ArrowUpward fontSize="small" color="success" />
                            </Box>
                          </Box>
                          <Typography variant="h6">{formatNumber(mockData.playerStats.activeUsers.value)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Retention Rate</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" color="success.main" sx={{ mr: 0.5 }}>
                                +{mockData.playerStats.retention.change}%
                              </Typography>
                              <ArrowUpward fontSize="small" color="success" />
                            </Box>
                          </Box>
                          <Typography variant="h6">{mockData.playerStats.retention.value}%</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={mockData.playerStats.retention.value} 
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Churn Rate</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" color="error.main" sx={{ mr: 0.5 }}>
                                {mockData.playerStats.churn.change}%
                              </Typography>
                              <ArrowDownward fontSize="small" color="error" />
                            </Box>
                          </Box>
                          <Typography variant="h6">{mockData.playerStats.churn.value}%</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={mockData.playerStats.churn.value} 
                            sx={{ mt: 1, height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: 'error.main' } }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {dashboardWidgets.includes('gameStats') && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Game Performance" 
                    action={
                      <IconButton aria-label="refresh">
                        <Refresh />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {mockData.gamePerformance.map((game, index) => (
                      <Box key={index} sx={{ mb: index < mockData.gamePerformance.length - 1 ? 2 : 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{game.name}</Typography>
                          <Typography variant="body2">{game.performance}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={game.performance} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': { 
                              bgcolor: game.performance > 80 ? 'success.main' : 
                                      game.performance > 60 ? 'primary.main' : 'warning.main'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {dashboardWidgets.includes('topGames') && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Top Games" 
                    action={
                      <IconButton aria-label="settings">
                        <MoreVert />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <List sx={{ p: 0 }}>
                    {mockData.topGames.map((game, index) => (
                      <React.Fragment key={game.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'secondary.main' }}>
                              {index + 1}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={game.name} 
                            secondary={`${formatNumber(game.players)} active players`}
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {game.trend === 'up' ? (
                                <ArrowUpward fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                              ) : (
                                <ArrowDownward fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                              )}
                              <Chip 
                                label={`${game.trend === 'up' ? '+' : '-'}${game.change}%`}
                                size="small"
                                color={game.trend === 'up' ? 'success' : 'error'}
                                variant="outlined"
                              />
                              <IconButton edge="end" aria-label="view">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < mockData.topGames.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              </Grid>
            )}
            
            {dashboardWidgets.includes('recentActivity') && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Recent Activity" 
                    action={
                      <Button 
                        size="small" 
                        endIcon={<Refresh />}
                        sx={{ textTransform: 'none' }}
                      >
                        Refresh
                      </Button>
                    }
                  />
                  <Divider />
                  <List sx={{ p: 0 }}>
                    {mockData.recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="body2">
                                <Typography component="span" fontWeight="medium">
                                  {activity.name}
                                </Typography>
                                {' '}{activity.action}{' '}
                                <Typography component="span" fontWeight="medium">
                                  {activity.target}
                                </Typography>
                              </Typography>
                            }
                            secondary={activity.time}
                          />
                        </ListItem>
                        {index < mockData.recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Divider />
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button size="small" sx={{ textTransform: 'none' }}>
                      View All Activities
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Players Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader 
              title="Player Overview" 
              subheader="Track all your player metrics in one place"
            />
            <Divider />
            <CardContent sx={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Detailed player statistics will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Games Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              title="Games Overview" 
              subheader="Monitor your game performance metrics"
            />
            <Divider />
            <CardContent sx={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Detailed game statistics will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Activities Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader 
              title="Recent Activities" 
              subheader="Track all recent activities across your platform"
            />
            <Divider />
            <CardContent sx={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Activity feed will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MuiDashboard;
