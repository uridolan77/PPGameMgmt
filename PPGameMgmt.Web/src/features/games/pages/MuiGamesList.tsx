import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../hooks';
import { Game, GameFilter } from '../types';
import { GameCard } from '../components';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

// MUI Icons
import {
  Add as AddIcon,
  TrendingUp,
  SportsEsports as GamesIcon,
  VideogameAsset as ActiveGamesIcon,
  Block as InactiveGamesIcon,
  Stars as PopularGamesIcon
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

const MuiGamesList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GameFilter>({
    isActive: undefined,
    searchTerm: '',
    category: undefined,
    provider: undefined,
    sortBy: 'popularity',
    sortDirection: 'desc'
  });

  // Use our custom useGames hook to fetch data
  const {
    games,
    isLoading,
    isError,
    error,
    refetch,
    toggleGameStatus
  } = useGames(filters);

  // Handle game click navigation
  const handleGameClick = (game: Game) => {
    navigate(`/games/${game.id}`);
  };

  // Handle adding a new game
  const handleAddGame = () => {
    navigate('/games/new');
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting games as ${format}`);
    // Implementation would go here
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate game statistics
  const gameStats = useMemo(() => {
    if (!games) return {
      totalGames: 0,
      activeGames: 0,
      inactiveGames: 0,
      popularGames: 0
    };

    const totalGames = games.length;
    const activeGames = games.filter(game => game.isActive).length;
    const inactiveGames = totalGames - activeGames;
    const popularGames = games.filter(game => game.popularity > 4).length;

    return {
      totalGames,
      activeGames,
      inactiveGames,
      popularGames
    };
  }, [games]);

  // Memoize filtered games to avoid unnecessary re-filtering
  const filteredGames = useMemo(() => {
    if (!games) return [];

    return games.filter((game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  // Define columns for the data table
  const columns: Column<Game>[] = [
    { 
      id: 'title', 
      label: 'Title',
      format: (value, game) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            src={game.thumbnailUrl} 
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          >
            {value.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">{value}</Typography>
            <Typography variant="caption" color="text.secondary">{game.provider}</Typography>
          </Box>
        </Box>
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
      id: 'releaseDate', 
      label: 'Release Date',
      format: (value) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'popularity', 
      label: 'Popularity',
      align: 'center',
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2">{value.toFixed(1)}</Typography>
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
              width: `${(value / 5) * 100}%`,
              bgcolor: value > 4 ? 'success.main' : value > 3 ? 'primary.main' : 'warning.main',
              borderRadius: 3
            }} />
          </Box>
        </Box>
      )
    },
    { 
      id: 'isActive', 
      label: 'Status',
      align: 'center',
      format: (value) => (
        <Chip 
          label={value ? 'Active' : 'Inactive'} 
          size="small" 
          color={value ? 'success' : 'error'}
          variant="outlined"
        />
      )
    },
    { 
      id: 'actions', 
      label: 'Actions',
      align: 'center',
      format: (_, game) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              toggleGameStatus({ id: game.id, isActive: !game.isActive });
            }}
          >
            {game.isActive ? <InactiveGamesIcon fontSize="small" /> : <ActiveGamesIcon fontSize="small" />}
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <PageHeader
        title="Games Management"
        description="Manage and monitor all games on your platform"
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddGame}
          >
            Add Game
          </Button>
        }
      />

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Games"
            value={formatNumber(gameStats.totalGames)}
            icon={<GamesIcon />}
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
            title="Active Games"
            value={formatNumber(gameStats.activeGames)}
            icon={<ActiveGamesIcon />}
            iconColor="success.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: `${Math.round((gameStats.activeGames / gameStats.totalGames) * 100) || 0}% of total games`,
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Games"
            value={formatNumber(gameStats.inactiveGames)}
            icon={<InactiveGamesIcon />}
            iconColor="error.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />,
              text: `${Math.round((gameStats.inactiveGames / gameStats.totalGames) * 100) || 0}% of total games`,
              color: "error.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Popular Games"
            value={formatNumber(gameStats.popularGames)}
            icon={<PopularGamesIcon />}
            iconColor="warning.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: `${Math.round((gameStats.popularGames / gameStats.totalGames) * 100) || 0}% of total games`,
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
            <Tab label="All Games" id="games-tab-0" aria-controls="games-tabpanel-0" />
            <Tab label="Active Games" id="games-tab-1" aria-controls="games-tabpanel-1" />
            <Tab label="Inactive Games" id="games-tab-2" aria-controls="games-tabpanel-2" />
            <Tab label="Popular Games" id="games-tab-3" aria-controls="games-tabpanel-3" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Search and Filters */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search games by title, provider or category..."
            onExport={handleExport}
            exportOptions={['csv', 'excel', 'pdf']}
          />

          {/* Games List Table */}
          <TabPanel value={tabValue} index={0}>
            <DataTable
              columns={columns}
              data={filteredGames}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading game data"
              emptyMessage="No games found"
              onRowClick={handleGameClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DataTable
              columns={columns}
              data={filteredGames.filter(game => game.isActive)}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading game data"
              emptyMessage="No active games found"
              onRowClick={handleGameClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <DataTable
              columns={columns}
              data={filteredGames.filter(game => !game.isActive)}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading game data"
              emptyMessage="No inactive games found"
              onRowClick={handleGameClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <DataTable
              columns={columns}
              data={filteredGames.filter(game => game.popularity > 4)}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading game data"
              emptyMessage="No popular games found"
              onRowClick={handleGameClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default MuiGamesList;
