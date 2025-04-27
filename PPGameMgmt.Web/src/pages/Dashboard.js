import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, Typography, Box, Paper, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { playerApi, gameApi, bonusApi } from "../services/api";
import PlayerActivityCard from "../components/dashboard/PlayerActivityCard";
import TopGamesCard from "../components/dashboard/TopGamesCard";
import BonusPerformanceCard from "../components/dashboard/BonusPerformanceCard";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState({
    totalActive: 0,
    bySegment: {},
    newSignups: 0
  });
  const [gameStats, setGameStats] = useState({
    topPlayed: [],
    byCategory: {}
  });
  const [bonusStats, setBonusStats] = useState({
    active: 0,
    claimed: 0,
    completed: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch this data from your API
        // For demo purposes, we're simulating API responses
        
        // Simulate player statistics
        setPlayerStats({
          totalActive: 1250,
          bySegment: {
            VIP: 120,
            Regular: 450,
            Casual: 520,
            New: 160,
            Dormant: 80
          },
          newSignups: 45
        });
        
        // Fetch top games from API (or use mock data)
        try {
          const gamesResponse = await gameApi.getPopular(5);
          setGameStats({
            topPlayed: gamesResponse.data || [],
            byCategory: {
              Slots: 65,
              Table: 20,
              Live: 10,
              Other: 5
            }
          });
        } catch (error) {
          console.error("Error fetching game data:", error);
          // Use mock data as fallback
          setGameStats({
            topPlayed: [
              { id: "1", name: "Buffalo Blitz", type: "Slot", category: "Popular", playCount: 1250 },
              { id: "2", name: "Blackjack Pro", type: "Table", category: "Classic", playCount: 850 },
              { id: "3", name: "Mega Fortune", type: "Slot", category: "Progressive", playCount: 720 },
              { id: "4", name: "Roulette Live", type: "LiveDealer", category: "Live", playCount: 680 },
              { id: "5", name: "Book of Ra", type: "Slot", category: "Popular", playCount: 590 }
            ],
            byCategory: {
              Slots: 65,
              Table: 20,
              Live: 10,
              Other: 5
            }
          });
        }
        
        // Simulate bonus statistics
        setBonusStats({
          active: 12,
          claimed: 845,
          completed: 580,
          conversionRate: 68,
          byType: {
            "Deposit Match": 40,
            "Free Spins": 30,
            "Cashback": 15,
            "No Deposit": 10,
            "Other": 5
          }
        });
      } catch (error) {
        console.error("Dashboard data fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome to the Player Platform Game Management dashboard. Here's an overview of your gaming platform.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Active Players
              </Typography>
              <Typography variant="h3">{playerStats.totalActive.toLocaleString()}</Typography>
              <Typography variant="body2" color="textSecondary">
                {playerStats.newSignups} new players today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Active Bonuses
              </Typography>
              <Typography variant="h3">{bonusStats.active}</Typography>
              <Typography variant="body2" color="textSecondary">
                {bonusStats.claimed} claims this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Bonus Completion Rate
              </Typography>
              <Typography variant="h3">{Math.round((bonusStats.completed / bonusStats.claimed) * 100)}%</Typography>
              <Typography variant="body2" color="textSecondary">
                Based on {bonusStats.claimed} total claims
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Player Segments Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Player Segments
              </Typography>
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Pie 
                  data={{
                    labels: Object.keys(playerStats.bySegment),
                    datasets: [
                      {
                        data: Object.values(playerStats.bySegment),
                        backgroundColor: [
                          theme.palette.primary.main,
                          theme.palette.secondary.main,
                          theme.palette.success.main,
                          theme.palette.info.main,
                          theme.palette.warning.main,
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Game Categories Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Game Distribution
              </Typography>
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Bar
                  data={{
                    labels: Object.keys(gameStats.byCategory),
                    datasets: [
                      {
                        label: "% of Games Played",
                        data: Object.values(gameStats.byCategory),
                        backgroundColor: theme.palette.primary.main,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Games Table */}
        <Grid item xs={12} md={6}>
          <TopGamesCard games={gameStats.topPlayed} />
        </Grid>

        {/* Bonus Performance Card */}
        <Grid item xs={12} md={6}>
          <BonusPerformanceCard bonusData={bonusStats} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;