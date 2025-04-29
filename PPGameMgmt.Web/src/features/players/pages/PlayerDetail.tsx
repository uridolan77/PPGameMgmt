import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { usePlayer, usePlayerGameSessions, usePlayerFeatures, usePlayerBonusClaims } from '../hooks';
import { useStore } from '../../../core/store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`player-tabpanel-${index}`}
      aria-labelledby={`player-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ui } = useStore();
  const [tabValue, setTabValue] = useState(0);
  
  // Convert id to number for API calls
  const playerId = id ? parseInt(id, 10) : undefined;

  // Fetch player data
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  
  // Fetch related player data
  const { data: gameSessions, isLoading: sessionsLoading } = usePlayerGameSessions(playerId);
  const { data: features, isLoading: featuresLoading } = usePlayerFeatures(playerId);
  const { data: bonusClaims, isLoading: bonusesLoading } = usePlayerBonusClaims(playerId);

  // Tab handling
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle player deletion
  const handleDeletePlayer = () => {
    // In a real app, this would show a confirmation dialog
    ui.addNotification({
      type: 'warning',
      message: 'This action would delete the player (demo only)',
      autoClose: true
    });
  };

  if (playerLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Skeleton height={50} width={200} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton height={30} width="60%" />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (!player) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" color="error">
          Player not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/players')}
          sx={{ mt: 2 }}
        >
          Back to Players
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with back button and actions */}
      <Box mb={4}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/players')}
          sx={{ mb: 2 }}
        >
          Back to Players
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'primary.main',
                fontSize: 24,
                mr: 2
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Typography variant="h4">
                {player.username}
              </Typography>
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {player.email}
                </Typography>
              </Box>
            </div>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/players/edit/${player.id}`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeletePlayer}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Status chip */}
      <Box mb={3}>
        <Chip
          label={player.isActive ? "Active" : "Inactive"}
          color={player.isActive ? "success" : "error"}
          sx={{ fontWeight: 500 }}
        />
        
        <Chip
          label={`Level ${player.playerLevel}`}
          variant="outlined"
          sx={{ ml: 1 }}
        />
        
        {player.segment && (
          <Chip
            icon={<TagIcon />}
            label={player.segment}
            variant="outlined"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      {/* Tabs navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          aria-label="player details tabs"
        >
          <Tab label="Overview" />
          <Tab label="Game History" />
          <Tab label="Bonuses" />
          <Tab label="Features" />
        </Tabs>

        <Divider />

        {/* Tab content panels */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Player Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Account Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Username</Typography>
                    <Typography variant="body1">{player.username}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{player.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Player Level</Typography>
                    <Typography variant="body1">{player.playerLevel}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{player.isActive ? 'Active' : 'Inactive'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Activity Summary</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Last Login</Typography>
                    <Typography variant="body1">{player.lastLogin ? formatDate(player.lastLogin) : 'Never'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Game Sessions</Typography>
                    <Typography variant="body1">{sessionsLoading ? '...' : gameSessions?.length || 0}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Bonus Claims</Typography>
                    <Typography variant="body1">{bonusesLoading ? '...' : bonusClaims?.length || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Enabled Features</Typography>
                    <Typography variant="body1">
                      {featuresLoading 
                        ? '...' 
                        : features?.filter(f => f.isEnabled).length || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Game History</Typography>
          {sessionsLoading ? (
            <Box sx={{ p: 2 }}>Loading game history...</Box>
          ) : gameSessions && gameSessions.length > 0 ? (
            <Paper>
              <List>
                {gameSessions.map((session) => (
                  <React.Fragment key={session.id}>
                    <ListItem>
                      <ListItemText
                        primary={session.gameName}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {formatDate(session.startTime)}
                            </Typography>
                            {" — Duration: "}
                            {Math.round(session.duration / 60)} minutes
                            {" • "}
                            Bet: ${session.betAmount.toFixed(2)}
                            {" • "}
                            Win: ${session.winAmount.toFixed(2)}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ) : (
            <Typography color="text.secondary">No game sessions found</Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Bonus Claims</Typography>
          {bonusesLoading ? (
            <Box sx={{ p: 2 }}>Loading bonus claims...</Box>
          ) : bonusClaims && bonusClaims.length > 0 ? (
            <Paper>
              <List>
                {bonusClaims.map((bonus) => (
                  <React.Fragment key={bonus.id}>
                    <ListItem>
                      <ListItemText
                        primary={bonus.bonusName}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Claimed on {formatDate(bonus.claimDate)}
                            </Typography>
                            {" — Value: "}
                            ${bonus.value.toFixed(2)}
                            {" • "}
                            Status: {bonus.status}
                          </>
                        }
                      />
                      <Chip 
                        label={bonus.status} 
                        color={
                          bonus.status === 'Completed' ? 'success' :
                          bonus.status === 'Active' ? 'primary' :
                          bonus.status === 'Expired' ? 'error' : 'default'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ) : (
            <Typography color="text.secondary">No bonus claims found</Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Player Features</Typography>
          {featuresLoading ? (
            <Box sx={{ p: 2 }}>Loading features...</Box>
          ) : features && features.length > 0 ? (
            <Grid container spacing={2}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} md={4} key={feature.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      border: 1, 
                      borderColor: feature.isEnabled ? 'success.main' : 'error.main',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1">{feature.name}</Typography>
                    <Chip
                      label={feature.isEnabled ? 'Enabled' : 'Disabled'}
                      color={feature.isEnabled ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary">No features found</Typography>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PlayerDetail;