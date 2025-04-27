import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  AccountCircle,
  Casino,
  CardGiftcard,
  TrendingUp,
  History,
  InsightsOutlined,
} from "@mui/icons-material";
import { playerApi, gameApi, bonusApi, recommendationApi } from "../services/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PlayerInfoCard from "../components/players/PlayerInfoCard";
import PlayerSegmentSelector from "../components/players/PlayerSegmentSelector";
import GameSessionsTable from "../components/players/GameSessionsTable";
import BonusHistoryTable from "../components/players/BonusHistoryTable";
import PlayerRecommendations from "../components/recommendations/PlayerRecommendations";
import PlayerFeatures from "../components/players/PlayerFeatures";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PlayerProfile = () => {
  const { playerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerValue, setPlayerValue] = useState(null);
  const [gameSessions, setGameSessions] = useState([]);
  const [bonusClaims, setBonusClaims] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch player details
        const playerResponse = await playerApi.getById(playerId);
        setPlayer(playerResponse.data);

        // Fetch player value
        const valueResponse = await playerApi.getPlayerValue(playerId);
        setPlayerValue(valueResponse.data.value);

        // Fetch game sessions (would be implemented in real API)
        // For now, we'll use mock data
        setGameSessions([
          {
            id: "gs1",
            gameId: "game1",
            gameName: "Starburst",
            startTime: new Date(2023, 3, 15, 14, 30).toISOString(),
            endTime: new Date(2023, 3, 15, 15, 45).toISOString(),
            duration: "1h 15m",
            totalBets: 120.50,
            totalWins: 85.75,
            netResult: -34.75,
            deviceType: "Mobile",
          },
          {
            id: "gs2",
            gameId: "game2",
            gameName: "Gonzo's Quest",
            startTime: new Date(2023, 3, 14, 20, 15).toISOString(),
            endTime: new Date(2023, 3, 14, 21, 30).toISOString(),
            duration: "1h 15m",
            totalBets: 200.00,
            totalWins: 320.50,
            netResult: 120.50,
            deviceType: "Desktop",
          },
          {
            id: "gs3",
            gameId: "game3",
            gameName: "Book of Dead",
            startTime: new Date(2023, 3, 12, 18, 0).toISOString(),
            endTime: new Date(2023, 3, 12, 19, 10).toISOString(),
            duration: "1h 10m",
            totalBets: 150.00,
            totalWins: 130.25,
            netResult: -19.75,
            deviceType: "Desktop",
          },
        ]);

        // Fetch bonus claims (would be implemented in real API)
        // For now, we'll use mock data
        setBonusClaims([
          {
            id: "bc1",
            bonusId: "bonus1",
            bonusName: "Welcome Bonus",
            claimDate: new Date(2023, 2, 10).toISOString(),
            status: "Completed",
            amount: 100.00,
            wageringProgress: 100,
            expiryDate: new Date(2023, 2, 25).toISOString(),
          },
          {
            id: "bc2",
            bonusId: "bonus2",
            bonusName: "Weekly Reload",
            claimDate: new Date(2023, 3, 5).toISOString(),
            status: "Active",
            amount: 50.00,
            wageringProgress: 65,
            expiryDate: new Date(2023, 3, 20).toISOString(),
          },
          {
            id: "bc3",
            bonusId: "bonus3",
            bonusName: "Free Spins",
            claimDate: new Date(2023, 3, 12).toISOString(),
            status: "Active",
            amount: 20.00,
            wageringProgress: 30,
            expiryDate: new Date(2023, 3, 27).toISOString(),
          },
        ]);

        // Fetch player recommendations
        try {
          const recommendationsResponse = await recommendationApi.getRecommendation(playerId);
          setRecommendations(recommendationsResponse.data);
        } catch (recommendationError) {
          console.error("Error fetching recommendations:", recommendationError);
          // Don't set the main error state, just log it
          // This way the profile still loads even if recommendations fail
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching player data:", error);
        setError("Failed to load player data. Please try again later.");
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSegmentChange = async (newSegment) => {
    try {
      await playerApi.updateSegment(playerId, newSegment);
      
      // Update the player data in the state
      setPlayer(prev => ({
        ...prev,
        segment: newSegment
      }));
    } catch (error) {
      console.error("Error updating player segment:", error);
      // Show an error message
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!player) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="info">Player not found</Alert>
      </Box>
    );
  }

  // For the activity chart
  const activityData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Gaming Sessions",
        data: [12, 19, 15, 25, 22, 30],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const valueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Player Value",
        data: [50, 75, 90, 120, 150, playerValue || 180],
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Player Summary Section */}
        <Grid item xs={12} md={4}>
          <PlayerInfoCard player={player} playerValue={playerValue} />
        </Grid>

        {/* Player Segment Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" component="h2">
                Player Segment
              </Typography>
            </Box>
            <PlayerSegmentSelector 
              currentSegment={player.segment} 
              onSegmentChange={handleSegmentChange} 
            />
          </Paper>

          {/* Charts Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Player Activity & Value
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Line
                  data={activityData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "Monthly Gaming Sessions",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Line
                  data={valueData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "Monthly Player Value",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12}>
          <Paper sx={{ width: "100%" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab icon={<Casino />} label="GAME SESSIONS" iconPosition="start" />
              <Tab icon={<CardGiftcard />} label="BONUS HISTORY" iconPosition="start" />
              <Tab icon={<TrendingUp />} label="RECOMMENDATIONS" iconPosition="start" />
              <Tab icon={<InsightsOutlined />} label="PLAYER FEATURES" iconPosition="start" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {/* Game Sessions Tab */}
              {activeTab === 0 && (
                <GameSessionsTable sessions={gameSessions} />
              )}
              
              {/* Bonus History Tab */}
              {activeTab === 1 && (
                <BonusHistoryTable bonuses={bonusClaims} />
              )}
              
              {/* Recommendations Tab */}
              {activeTab === 2 && (
                <PlayerRecommendations 
                  playerId={playerId} 
                  recommendations={recommendations} 
                />
              )}

              {/* Player Features Tab */}
              {activeTab === 3 && (
                <PlayerFeatures playerId={playerId} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlayerProfile;