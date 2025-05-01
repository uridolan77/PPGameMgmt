import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating
} from '@mui/material';

// MUI Icons
import {
  Recommend as RecommendIcon,
  TrendingUp,
  SportsEsports as GamesIcon,
  Person as PlayerIcon,
  Casino as CasinoIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

// Shared MUI Components
import {
  PageHeader,
  StatCard,
  TabPanel,
  SearchFilterBar,
  DataTable,
  Column
} from '../../../shared/components/mui';

// Mock data for recommendations
const mockRecommendations = [
  {
    id: 1,
    playerName: 'John Doe',
    playerId: 101,
    gameTitle: 'Mystic Fortune',
    gameId: 201,
    score: 0.92,
    reason: 'Based on similar games played',
    category: 'Slots'
  },
  {
    id: 2,
    playerName: 'Jane Smith',
    playerId: 102,
    gameTitle: 'Golden Treasures',
    gameId: 202,
    score: 0.89,
    reason: 'Popular among similar players',
    category: 'Slots'
  },
  {
    id: 3,
    playerName: 'Mike Johnson',
    playerId: 103,
    gameTitle: 'Poker Master',
    gameId: 203,
    score: 0.85,
    reason: 'Based on player preferences',
    category: 'Table Games'
  },
  {
    id: 4,
    playerName: 'Sarah Williams',
    playerId: 104,
    gameTitle: 'Lucky Spin',
    gameId: 204,
    score: 0.82,
    reason: 'Recently played similar games',
    category: 'Slots'
  },
  {
    id: 5,
    playerName: 'Robert Brown',
    playerId: 105,
    gameTitle: 'Blackjack Pro',
    gameId: 205,
    score: 0.78,
    reason: 'Based on player history',
    category: 'Table Games'
  }
];

// Mock data for popular games
const mockPopularGames = [
  { id: 1, title: 'Mystic Fortune', category: 'Slots', popularity: 4.8 },
  { id: 2, title: 'Golden Treasures', category: 'Slots', popularity: 4.7 },
  { id: 3, title: 'Poker Master', category: 'Table Games', popularity: 4.6 },
  { id: 4, title: 'Lucky Spin', category: 'Slots', popularity: 4.5 },
  { id: 5, title: 'Blackjack Pro', category: 'Table Games', popularity: 4.4 }
];

const MuiRecommendations: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting recommendations as ${format}`);
    // Implementation would go here
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Define columns for the recommendations data table
  const recommendationColumns: Column<typeof mockRecommendations[0]>[] = [
    { 
      id: 'playerName', 
      label: 'Player',
      format: (value, rec) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{value}</Typography>
        </Box>
      )
    },
    { 
      id: 'gameTitle', 
      label: 'Game',
      format: (value, rec) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Chip 
            label={rec.category} 
            size="small" 
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      )
    },
    { 
      id: 'score', 
      label: 'Match Score',
      align: 'center',
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2">{(value * 100).toFixed(0)}%</Typography>
          <Box sx={{ 
            width: 50, 
            height: 6, 
            ml: 1, 
            borderRadius: 3, 
            bgcolor: 'grey.300',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${value * 100}%`,
              bgcolor: value > 0.9 ? 'success.main' : value > 0.8 ? 'primary.main' : 'warning.main',
              borderRadius: 3
            }} />
          </Box>
        </Box>
      )
    },
    { 
      id: 'reason', 
      label: 'Reason',
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    },
    { 
      id: 'actions', 
      label: 'Actions',
      align: 'center',
      format: (_, rec) => (
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<RecommendIcon fontSize="small" />}
        >
          Send
        </Button>
      )
    }
  ];

  // Define columns for the popular games data table
  const popularGamesColumns: Column<typeof mockPopularGames[0]>[] = [
    { 
      id: 'title', 
      label: 'Game Title',
      format: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      )
    },
    { 
      id: 'category', 
      label: 'Category',
      format: (value) => (
        <Chip 
          label={value} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      id: 'popularity', 
      label: 'Popularity',
      align: 'center',
      format: (value) => (
        <Rating 
          value={value} 
          precision={0.1} 
          readOnly 
          size="small"
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <PageHeader
        title="Recommendations"
        description="Personalized game recommendations for players"
      />

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Recommendations"
            value="1,248"
            icon={<RecommendIcon />}
            iconColor="primary.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: "12% from last month",
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Players Reached"
            value="856"
            icon={<PlayerIcon />}
            iconColor="success.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: "8% from last month",
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Games Recommended"
            value="42"
            icon={<GamesIcon />}
            iconColor="warning.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: "5% from last month",
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value="24.8%"
            icon={<InsightsIcon />}
            iconColor="info.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: "3.2% from last month",
              color: "success.main"
            }}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            indicatorColor="primary"
            textColor="primary"
            sx={{ 
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 'medium'
              }
            }}
          >
            <Tab label="Player Recommendations" id="recommendations-tab-0" aria-controls="recommendations-tabpanel-0" />
            <Tab label="Popular Games" id="recommendations-tab-1" aria-controls="recommendations-tabpanel-1" />
            <Tab label="Analytics" id="recommendations-tab-2" aria-controls="recommendations-tabpanel-2" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Search and Filters */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search recommendations..."
            onExport={handleExport}
            exportOptions={['csv', 'excel', 'pdf']}
          />

          {/* Recommendations Table */}
          <TabPanel value={tabValue} index={0}>
            <DataTable
              columns={recommendationColumns}
              data={mockRecommendations.filter(rec => 
                rec.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rec.gameTitle.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              isLoading={false}
              isError={false}
              errorMessage="Error loading recommendations"
              emptyMessage="No recommendations found"
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          {/* Popular Games Table */}
          <TabPanel value={tabValue} index={1}>
            <DataTable
              columns={popularGamesColumns}
              data={mockPopularGames.filter(game => 
                game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.category.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              isLoading={false}
              isError={false}
              errorMessage="Error loading popular games"
              emptyMessage="No popular games found"
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Recommendation Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This section would display charts and analytics about recommendation performance.
              </Typography>
              <Box sx={{ mt: 4, mb: 2 }}>
                <Divider>
                  <Chip label="Sample Data" />
                </Divider>
              </Box>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Performing Recommendations
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <CasinoIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Mystic Fortune" 
                            secondary="42% conversion rate" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <CasinoIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Golden Treasures" 
                            secondary="38% conversion rate" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <CasinoIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Poker Master" 
                            secondary="35% conversion rate" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Player Engagement
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PlayerIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="VIP Players" 
                            secondary="68% engagement rate" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PlayerIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Regular Players" 
                            secondary="42% engagement rate" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PlayerIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="New Players" 
                            secondary="29% engagement rate" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default MuiRecommendations;
