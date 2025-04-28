import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { playerApi } from '../services/api';
import PlayerFeatures from '../components/players/PlayerFeatures';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`player-tabpanel-${index}`}
      aria-labelledby={`player-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PlayerDetails = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [gameHistoryLoading, setGameHistoryLoading] = useState(false);
  const [bonusesLoading, setBonusesLoading] = useState(false);

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await playerApi.getById(playerId);
        setPlayer(response.data);
      } catch (err) {
        console.error("Error fetching player data:", err);
        setError("Unable to load player details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  // Fetch game history when switching to that tab
  useEffect(() => {
    const fetchGameHistory = async () => {
      if (tabValue === 1 && playerId && gameHistory.length === 0) {
        setGameHistoryLoading(true);
        try {
          const response = await playerApi.getGameSessions(playerId);
          setGameHistory(response.data);
        } catch (err) {
          console.error("Error fetching game history:", err);
        } finally {
          setGameHistoryLoading(false);
        }
      }
    };
    
    fetchGameHistory();
  }, [tabValue, playerId, gameHistory.length]);

  // Fetch bonuses when switching to that tab
  useEffect(() => {
    const fetchBonuses = async () => {
      if (tabValue === 3 && playerId && bonuses.length === 0) {
        setBonusesLoading(true);
        try {
          const response = await playerApi.getBonusClaims(playerId);
          setBonuses(response.data);
        } catch (err) {
          console.error("Error fetching bonuses:", err);
        } finally {
          setBonusesLoading(false);
        }
      }
    };
    
    fetchBonuses();
  }, [tabValue, playerId, bonuses.length]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!player) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography>No player data found.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Player Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {player.firstName} {player.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Player ID: {player.id}
            </Typography>
            <Typography variant="body1">
              Email: {player.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Typography variant="body2">
                  Join Date: {new Date(player.registrationDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Status: <strong style={{ color: player.isActive ? 'green' : 'red' }}>
                    {player.isActive ? 'Active' : 'Inactive'}
                  </strong>
                </Typography>
                {player.lastLogin && (
                  <Typography variant="body2">
                    Last Login: {new Date(player.lastLogin).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

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
          <Tab label="Transactions" />
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
                  <Typography variant="subtitle1">Contact Information</Typography>
                  <Typography variant="body2">Email: {player.email}</Typography>
                  <Typography variant="body2">Phone: {player.phone || 'Not provided'}</Typography>
                  <Typography variant="body2">Country: {player.country || 'Not specified'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Account Information</Typography>
                  <Typography variant="body2">Username: {player.username}</Typography>
                  <Typography variant="body2">Registration Date: {new Date(player.registrationDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2">Account Status: {player.isActive ? 'Active' : 'Inactive'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Game History</Typography>
          {gameHistoryLoading ? (
            <CircularProgress />
          ) : (
            <Typography variant="body1">Game history will be displayed here.</Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Transaction History</Typography>
          <Typography variant="body1">Transaction history will be displayed here.</Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Bonuses</Typography>
          {bonusesLoading ? (
            <CircularProgress />
          ) : (
            <Typography variant="body1">Bonus information will be displayed here.</Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <PlayerFeatures playerId={playerId} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PlayerDetails;