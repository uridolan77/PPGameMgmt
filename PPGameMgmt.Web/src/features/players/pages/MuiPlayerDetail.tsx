import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerQueryV3, usePlayerGameSessionsV3, usePlayerFeaturesV3, usePlayerBonusClaimsV3 } from '../hooks';
import { Player, PlayerTabType, GameSession, PlayerFeature, BonusClaim } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { handleApiError, ErrorDomain } from '../../../core/error';

// MUI Components
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  AlertTitle
} from '@mui/material';

// MUI Icons
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Public as PublicIcon,
  SportsEsports as GamesIcon,
  CardGiftcard as BonusIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Shared MUI Components
import {
  PageHeader,
  TabPanel,
  DataTable,
  Column
} from '../../../shared/components/mui';

const MuiPlayerDetail: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Convert id to number for API calls
  const playerId = id ? parseInt(id, 10) : undefined;

  // Fetch player data with proper error handling
  const {
    data: player,
    isLoading: playerLoading,
    isError: playerIsError,
    error: playerError,
    refetch: refetchPlayer
  } = usePlayerQueryV3(playerId);

  // Fetch related player data with dependency on player existence
  const {
    data: gameSessions,
    isLoading: sessionsLoading,
    isError: sessionsIsError,
    error: sessionsError,
    refetch: refetchSessions
  } = usePlayerGameSessionsV3(playerId);

  const {
    data: features,
    isLoading: featuresLoading,
    isError: featuresIsError,
    error: featuresError,
    refetch: refetchFeatures
  } = usePlayerFeaturesV3(playerId);

  const {
    data: bonusClaims,
    isLoading: bonusesLoading,
    isError: bonusesIsError,
    error: bonusesError,
    refetch: refetchBonuses
  } = usePlayerBonusClaimsV3(playerId);

  // Handle API errors with more context
  useEffect(() => {
    if (playerIsError && playerError) {
      console.error('Error loading player data:', playerError);
      handleApiError(playerError, 'Failed to load player details', {
        domain: ErrorDomain.PLAYER,
        showToast: true,
        logError: true
      });
    }
  }, [playerIsError, playerError]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchPlayer();
    refetchSessions();
    refetchFeatures();
    refetchBonuses();
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeletePlayer = () => {
    // In a real implementation, this would call the delete API
    console.log('Deleting player:', player?.id);
    setDeleteDialogOpen(false);
    // Navigate back to players list after deletion
    navigate('/players');
  };

  // Generate a consistent color from a string for avatar
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };

  // Render loading state
  if (playerLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (playerIsError || !player) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/players')}
          sx={{ mb: 3 }}
        >
          Back to Players
        </Button>
        <Paper sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {playerError?.message || 'Failed to load player details'}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => refetchPlayer()}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // Define columns for game sessions table
  const gameSessionsColumns: Column<GameSession>[] = [
    {
      id: 'gameName',
      label: 'Game',
      minWidth: 150,
      format: (value) => value || 'Unknown'
    },
    {
      id: 'startTime',
      label: 'Date',
      minWidth: 120,
      format: (value) => formatDate(value)
    },
    {
      id: 'duration',
      label: 'Duration',
      minWidth: 100,
      format: (value) => `${value} sec`
    },
    {
      id: 'betAmount',
      label: 'Bet Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'winAmount',
      label: 'Win Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(value)
    }
  ];

  // Define columns for bonus claims table
  const bonusClaimsColumns: Column<BonusClaim>[] = [
    {
      id: 'bonusName',
      label: 'Bonus',
      minWidth: 150,
      format: (value) => value || 'Unknown'
    },
    {
      id: 'claimDate',
      label: 'Claim Date',
      minWidth: 120,
      format: (value) => formatDate(value)
    },
    {
      id: 'value',
      label: 'Value',
      minWidth: 100,
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          color={
            value === 'active' ? 'success' :
            value === 'expired' ? 'error' :
            value === 'pending' ? 'warning' : 'default'
          }
          size="small"
        />
      )
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      minWidth: 120,
      format: (value) => value ? formatDate(value) : 'N/A'
    }
  ];

  // Define columns for features table
  const featuresColumns: Column<PlayerFeature>[] = [
    {
      id: 'name',
      label: 'Feature',
      minWidth: 150,
      format: (value) => value || 'Unknown'
    },
    {
      id: 'isEnabled',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value ? 'Enabled' : 'Disabled'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/players')}
        sx={{ mb: 3 }}
      >
        Back to Players
      </Button>

      {/* Player header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: getAvatarColor(player.username),
                width: 64,
                height: 64,
                mr: 2
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {player.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {player.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={player.isActive ? 'Active' : 'Inactive'}
                  color={player.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {player.segment && (
                  <Chip
                    label={player.segment}
                    color={player.segment === 'VIP' ? 'primary' : 'default'}
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/players/${player.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteDialog}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Player quick info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Full Name:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {player.firstName && player.lastName
                  ? `${player.firstName} ${player.lastName}`
                  : 'Not provided'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Email:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {player.email || 'Not provided'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Registration Date:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {player.registrationDate
                  ? formatDate(player.registrationDate)
                  : 'Not available'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PublicIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Country:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {player.country || 'Not provided'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
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
            <Tab label="Overview" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Game History" icon={<GamesIcon />} iconPosition="start" />
            <Tab label="Bonuses" icon={<BonusIcon />} iconPosition="start" />
            <Tab label="Features" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Player Information" />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Username
                          </TableCell>
                          <TableCell>{player.username}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Email
                          </TableCell>
                          <TableCell>{player.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Status
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={player.isActive ? 'Active' : 'Inactive'}
                              color={player.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Segment
                          </TableCell>
                          <TableCell>
                            {player.segment ? (
                              <Chip
                                label={player.segment}
                                color={player.segment === 'VIP' ? 'primary' : 'default'}
                                size="small"
                              />
                            ) : (
                              'Standard'
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Player Level
                          </TableCell>
                          <TableCell>{player.playerLevel || player.level || 1}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Registration Date
                          </TableCell>
                          <TableCell>
                            {player.registrationDate
                              ? formatDate(player.registrationDate)
                              : 'Not available'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Last Login
                          </TableCell>
                          <TableCell>
                            {player.lastLogin
                              ? formatDate(player.lastLogin)
                              : 'Not available'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Personal Information" />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            First Name
                          </TableCell>
                          <TableCell>{player.firstName || 'Not provided'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Last Name
                          </TableCell>
                          <TableCell>{player.lastName || 'Not provided'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Country
                          </TableCell>
                          <TableCell>{player.country || 'Not provided'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Birth Date
                          </TableCell>
                          <TableCell>
                            {player.birthDate
                              ? formatDate(player.birthDate)
                              : 'Not provided'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Account Balance" />
                <CardContent>
                  <Typography variant="h4" component="div" color="primary">
                    {formatCurrency(player.balance || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {player.notes && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Notes" />
                  <CardContent>
                    <Typography variant="body1">{player.notes}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Game History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Game Sessions
            </Typography>
            <DataTable
              columns={gameSessionsColumns}
              data={gameSessions || []}
              isLoading={sessionsLoading}
              isError={sessionsIsError}
              errorMessage="Error loading game sessions"
              emptyMessage="No game sessions found"
              onRetry={() => refetchSessions()}
              pagination={true}
              initialRowsPerPage={10}
              loadingComponent={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading game sessions...
                  </Typography>
                </Box>
              }
            />
          </Box>
        </TabPanel>

        {/* Bonuses Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bonus Claims
            </Typography>
            <DataTable
              columns={bonusClaimsColumns}
              data={bonusClaims || []}
              isLoading={bonusesLoading}
              isError={bonusesIsError}
              errorMessage="Error loading bonus claims"
              emptyMessage="No bonus claims found"
              onRetry={() => refetchBonuses()}
              pagination={true}
              initialRowsPerPage={10}
              loadingComponent={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading bonus claims...
                  </Typography>
                </Box>
              }
            />
          </Box>
        </TabPanel>

        {/* Features Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Player Features
            </Typography>
            <DataTable
              columns={featuresColumns}
              data={features || []}
              isLoading={featuresLoading}
              isError={featuresIsError}
              errorMessage="Error loading player features"
              emptyMessage="No features found"
              onRetry={() => refetchFeatures()}
              pagination={true}
              initialRowsPerPage={10}
              loadingComponent={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading player features...
                  </Typography>
                </Box>
              }
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Player?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete player "{player.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeletePlayer} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MuiPlayerDetail;
