import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../hooks';
import { Game, GameFilter } from '../types';
import { GameCard } from '../components';
import { handleApiError, ErrorDomain } from '../../../core/error';

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
  Paper,
  CircularProgress
} from '@mui/material';

// MUI Icons
import {
  Add as AddIcon,
  TrendingUp,
  SportsEsports as GamesIcon,
  VideogameAsset as ActiveGamesIcon,
  Block as InactiveGamesIcon,
  Stars as PopularGamesIcon,
  Refresh as RefreshIcon
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

  // Log detailed information for debugging
  console.log('MuiGamesList: After useGames call', {
    games,
    isLoading,
    isError,
    error,
    gamesType: games ? typeof games : 'undefined',
    gamesIsArray: games ? Array.isArray(games) : false,
    gamesLength: games && Array.isArray(games) ? games.length : 'N/A'
  });

  // Handle API errors with more context
  React.useEffect(() => {
    if (isError && error) {
      console.error('Error loading games data:', error);
      handleApiError(error, 'Failed to load games', {
        domain: ErrorDomain.GAME,
        showToast: true,
        logError: true
      });
    }
  }, [isError, error]);

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
    // Default stats if no games data
    const defaultStats = {
      totalGames: 0,
      activeGames: 0,
      inactiveGames: 0,
      popularGames: 0
    };

    // Check if games exists and is an array
    if (!games || !Array.isArray(games)) {
      console.log('Games data is not an array:', games);
      return defaultStats;
    }

    console.log('Processing games array:', games);

    const totalGames = games.length;

    // Safely filter games with null checks
    const activeGames = games.filter(game => game && game.isActive).length;
    const inactiveGames = games.filter(game => game && !game.isActive).length;

    // Handle different popularity formats
    const popularGames = games.filter(game => {
      if (!game) return false;

      // Check if popularity is a number and greater than 4
      return typeof game.popularity === 'number' && game.popularity > 4;
    }).length;

    return {
      totalGames,
      activeGames,
      inactiveGames,
      popularGames
    };
  }, [games]);

  // Memoize filtered games to avoid unnecessary re-filtering
  const filteredGames = useMemo(() => {
    // Check if games exists and is an array
    if (!games || !Array.isArray(games)) {
      console.log('Games data is not an array for filtering:', games);
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return games;

    return games.filter((game) => {
      if (!game) return false;

      // Safely check title
      const title = game.title || '';
      if (title.toLowerCase().includes(query)) return true;

      // Safely check provider
      const provider = game.provider || '';
      if (provider.toLowerCase().includes(query)) return true;

      // Safely check category
      const category = game.category || '';
      if (category.toLowerCase().includes(query)) return true;

      // Check other fields that might be searchable
      const description = game.description || '';
      if (description.toLowerCase().includes(query)) return true;

      return false;
    });
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => refetch && refetch()}
              startIcon={<RefreshIcon />}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddGame}
            >
              Add Game
            </Button>
          </Box>
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
              data={Array.isArray(filteredGames) ? filteredGames : []}
              isLoading={isLoading}
              isError={isError}
              errorMessage="Error loading game data"
              emptyMessage="No games found"
              onRowClick={handleGameClick}
              pagination={true}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              loadingComponent={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading games...
                  </Typography>
                </Box>
              }
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DataTable
              columns={columns}
              data={filteredGames.filter(game => game && game.isActive)}
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
              data={filteredGames.filter(game => game && !game.isActive)}
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
              data={filteredGames.filter(game => game && typeof game.popularity === 'number' && game.popularity > 4)}
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
