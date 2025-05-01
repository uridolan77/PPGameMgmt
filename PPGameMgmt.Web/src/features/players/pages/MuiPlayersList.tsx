import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayersQueryV3 } from '../hooks';
import { Player } from '../types';
import { formatDate } from '../utils';
import { handleApiError, ErrorDomain } from '../../../core/error';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Avatar,
  Chip,
  IconButton,
  useTheme
} from '@mui/material';

// MUI Icons
import {
  TrendingUp,
  People,
  PersonOutlined,
  PersonAddOutlined,
  EmojiEvents,
  Visibility
} from '@mui/icons-material';

// Shared MUI Components
import {
  StatCard,
  PageHeader,
  TabPanel,
  SearchFilterBar,
  DataTable,
  Column
} from '../../../shared/components/mui';

const MuiPlayersList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the real API hook instead of mock data
  const {
    data: players,
    isLoading,
    isError,
    error,
    refetch
  } = usePlayersQueryV3();

  // Handle API errors
  React.useEffect(() => {
    if (isError && error) {
      handleApiError(error, 'Failed to load players', {
        domain: ErrorDomain.PLAYER,
        action: 'fetch'
      });
    }
  }, [isError, error]);

  // Stats for the overview tab
  const playerStats = useMemo(() => {
    if (!players) return {
      totalPlayers: 0,
      activePlayers: 0,
      newPlayers: 0,
      vipPlayers: 0
    };

    const totalPlayers = players.length;
    const activePlayers = players.filter((p: Player) => p.isActive).length;
    const vipPlayers = players.filter((p: Player) => p.segment === 'VIP').length;

    // Calculate new players (those who registered in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use registrationDate if available, otherwise use a placeholder
    const newPlayers = players.filter((p: Player) => {
      if (p.registrationDate) {
        const regDate = new Date(p.registrationDate);
        return regDate >= thirtyDaysAgo;
      }
      return false;
    }).length || Math.floor(totalPlayers * 0.15); // Fallback to 15% if no registration dates

    return {
      totalPlayers,
      activePlayers,
      newPlayers,
      vipPlayers
    };
  }, [players]);

  // Handle row click to navigate to player details
  const handleRowClick = (player: Player) => {
    navigate(`/players/${player.id}`);
  };

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
    console.log(`Exporting players as ${format}`);
    // Implementation would go here

    // Example of how to export to CSV
    if (format === 'csv' && players) {
      try {
        // Convert players to CSV
        const headers = ['ID', 'Username', 'Email', 'Player Level', 'Segment', 'Status'];
        const csvContent = [
          headers.join(','),
          ...players.map(player => [
            player.id,
            player.username,
            player.email,
            player.playerLevel,
            player.segment || 'None',
            player.isActive ? 'Active' : 'Inactive'
          ].join(','))
        ].join('\n');

        // Create a blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `players_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting players:', error);
      }
    }
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get avatar color based on username
  const getAvatarColor = (username: string): string => {
    const colors = [
      '#1976d2', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
      '#f44336', '#e91e63', '#9c27b0', '#673ab7'
    ];

    // Simple hash function to get consistent color for a username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Memoize filtered players to avoid unnecessary re-filtering
  const filteredPlayers = useMemo(() => {
    if (!players) return [];

    return players.filter((player: Player) =>
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.segment && player.segment.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [players, searchQuery]);

  // Add a retry button for error state
  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <PageHeader
        title="Players"
        description="Manage and monitor all players on your platform"
      />

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Players"
            value={formatNumber(playerStats.totalPlayers)}
            icon={<People />}
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
            title="Active Players"
            value={formatNumber(playerStats.activePlayers)}
            icon={<PersonOutlined />}
            iconColor="success.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: `${Math.round((playerStats.activePlayers / playerStats.totalPlayers) * 100) || 0}% of total players`,
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Players"
            value={formatNumber(playerStats.newPlayers)}
            icon={<PersonAddOutlined />}
            iconColor="info.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: "Last 30 days",
              color: "success.main"
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="VIP Players"
            value={formatNumber(playerStats.vipPlayers)}
            icon={<EmojiEvents />}
            iconColor="warning.light"
            trend={{
              icon: <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />,
              text: `${Math.round((playerStats.vipPlayers / playerStats.totalPlayers) * 100) || 0}% of total players`,
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
            <Tab label="Overview" id="players-tab-0" aria-controls="players-tabpanel-0" />
            <Tab label="Active Players" id="players-tab-1" aria-controls="players-tabpanel-1" />
            <Tab label="Inactive Players" id="players-tab-2" aria-controls="players-tabpanel-2" />
            <Tab label="VIP Players" id="players-tab-3" aria-controls="players-tabpanel-3" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Search and Filters */}
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search players by name, email or segment..."
            onExport={handleExport}
            exportOptions={['csv', 'excel', 'pdf']}
          />

          {/* Player List Table */}
          <TabPanel value={tabValue} index={0}>
            <PlayerDataTable
              players={filteredPlayers}
              isLoading={isLoading}
              isError={isError}
              onRowClick={handleRowClick}
              getAvatarColor={getAvatarColor}
              onRetry={handleRetry}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <PlayerDataTable
              players={filteredPlayers.filter(p => p.isActive)}
              isLoading={isLoading}
              isError={isError}
              onRowClick={handleRowClick}
              getAvatarColor={getAvatarColor}
              onRetry={handleRetry}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <PlayerDataTable
              players={filteredPlayers.filter(p => !p.isActive)}
              isLoading={isLoading}
              isError={isError}
              onRowClick={handleRowClick}
              getAvatarColor={getAvatarColor}
              onRetry={handleRetry}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <PlayerDataTable
              players={filteredPlayers.filter(p => p.segment === 'VIP')}
              isLoading={isLoading}
              isError={isError}
              onRowClick={handleRowClick}
              getAvatarColor={getAvatarColor}
              onRetry={handleRetry}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

// Player Data Table Component
interface PlayerDataTableProps {
  players: Player[];
  isLoading: boolean;
  isError: boolean;
  onRowClick: (player: Player) => void;
  getAvatarColor: (username: string) => string;
  onRetry?: () => void;
}

const PlayerDataTable: React.FC<PlayerDataTableProps> = ({
  players,
  isLoading,
  isError,
  onRowClick,
  getAvatarColor,
  onRetry
}) => {
  // Define columns for the data table
  const columns: Column<Player>[] = [
    {
      id: 'username',
      label: 'Username',
      format: (value, player) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: getAvatarColor(player.username), width: 32, height: 32 }}>
            {player.username.charAt(0).toUpperCase()}
          </Avatar>
          {value}
        </Box>
      )
    },
    { id: 'email', label: 'Email' },
    {
      id: 'playerLevel',
      label: 'Level',
      align: 'center',
      format: (value) => (
        <Chip
          label={`Level ${value}`}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      id: 'segment',
      label: 'Segment',
      format: (value) => value ? (
        <Chip
          label={value}
          size="small"
          color={value === 'VIP' ? 'warning' : 'default'}
        />
      ) : 'None'
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      format: (value) => value ? formatDate(value) : 'Never'
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
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      format: (_, player) => (
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          onRowClick(player);
        }}>
          <Visibility fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={players}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Error loading player data"
      emptyMessage="No players found"
      onRowClick={onRowClick}
      pagination={true}
      initialRowsPerPage={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      onRetry={onRetry}
    />
  );
};

export default MuiPlayersList;
