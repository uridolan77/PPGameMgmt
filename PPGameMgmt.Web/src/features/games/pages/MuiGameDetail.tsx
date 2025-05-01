import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks';
import { Game } from '../types';
import { formatDate, formatNumber } from '../../../shared/utils/formatting';
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
  Chip,
  IconButton,
  CircularProgress,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
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
  AlertTitle,
  Rating
} from '@mui/material';

// MUI Icons
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  SportsEsports as GameIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  Casino as CasinoIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

// Shared MUI Components
import {
  PageHeader,
  TabPanel,
  DataTable,
  Column
} from '../../../shared/components/mui';

const MuiGameDetail: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch game data
  const {
    data: game,
    isLoading,
    isError,
    error,
    refetch
  } = useGame(id);

  // Handle API errors with more context
  useEffect(() => {
    if (isError && error) {
      console.error('Error loading game data:', error);
      handleApiError(error, 'Failed to load game details', {
        domain: ErrorDomain.GAME,
        showToast: true,
        logError: true
      });
    }
  }, [isError, error]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteGame = () => {
    // In a real implementation, this would call the delete API
    console.log('Deleting game:', game?.id);
    setDeleteDialogOpen(false);
    // Navigate back to games list after deletion
    navigate('/games');
  };

  // Render loading state
  if (isLoading) {
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
  if (isError || !game) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/games')}
          sx={{ mb: 3 }}
        >
          Back to Games
        </Button>
        <Paper sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error?.message || 'Failed to load game details'}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => refetch()}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/games')}
        sx={{ mb: 3 }}
      >
        Back to Games
      </Button>

      {/* Game header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              {game.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip
                label={game.isActive ? 'Active' : 'Inactive'}
                color={game.isActive ? 'success' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                {game.provider} • {game.category}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/games/${game.id}/edit`)}
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

        {/* Game quick info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CategoryIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Category:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {game.category}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CasinoIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Type:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {game.type || 'Not specified'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Release Date:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {game.releaseDate ? formatDate(game.releaseDate) : 'Not available'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Popularity:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {typeof game.popularity === 'number' ? (
                  <Rating value={game.popularity / 2} readOnly precision={0.5} size="small" />
                ) : (
                  'Not rated'
                )}
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
            <Tab label="Overview" icon={<GameIcon />} iconPosition="start" />
            <Tab label="Performance" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Description" />
                <CardContent>
                  <Typography variant="body1">
                    {game.description || 'No description available.'}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Features" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {game.features && game.features.length > 0 ? (
                      game.features.map((feature, index) => (
                        <Chip key={index} label={feature} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No features specified
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3 }}>
                {game.thumbnailUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={game.thumbnailUrl}
                    alt={game.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Game Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Provider
                          </TableCell>
                          <TableCell>{game.provider}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            RTP
                          </TableCell>
                          <TableCell>{game.rtp ? `${game.rtp}%` : 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Volatility
                          </TableCell>
                          <TableCell>{game.volatility || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Min Bet
                          </TableCell>
                          <TableCell>{game.minBet ? `$${game.minBet}` : 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Max Bet
                          </TableCell>
                          <TableCell>{game.maxBet ? `$${game.maxBet}` : 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Genre
                          </TableCell>
                          <TableCell>{game.genre || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Game URL" />
                <CardContent>
                  <Box sx={{ wordBreak: 'break-all' }}>
                    {game.gameUrl ? (
                      <Typography variant="body2">
                        <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">
                          {game.gameUrl}
                        </a>
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No game URL available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader title="Game Performance" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Popularity Score
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {typeof game.popularity === 'number' ? game.popularity.toFixed(1) : 'N/A'}
                    </Typography>
                    <Rating
                      value={typeof game.popularity === 'number' ? game.popularity / 2 : 0}
                      readOnly
                      precision={0.5}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Players
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {/* This would come from the API in a real implementation */}
                      {formatNumber(Math.floor(Math.random() * 10000))}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Average Session
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {/* This would come from the API in a real implementation */}
                      {Math.floor(Math.random() * 30) + 5} min
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" paragraph>
                Performance metrics would be displayed here in a real implementation. This would include charts showing player engagement, revenue, and other key performance indicators over time.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader title="Game Settings" />
            <CardContent>
              <Typography variant="body1" paragraph>
                Game settings and configuration options would be displayed here in a real implementation. This would include options to adjust game parameters, visibility, and other settings.
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Compatible Devices
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {game.compatibleDevices && game.compatibleDevices.length > 0 ? (
                    game.compatibleDevices.map((device, index) => (
                      <Chip key={index} label={device} />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No device compatibility information available
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
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
          {"Delete Game?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete game "{game.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteGame} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MuiGameDetail;
