import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame, useGamePopularityStats, useGameRevenueStats } from '../../hooks/useGames';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GameDetail = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = React.useState(0);
  
  // Use our React Query hooks to fetch game data and stats
  const { data: game, isLoading: gameLoading, error: gameError } = useGame(id);
  const { data: popularityStats, isLoading: popularityLoading } = useGamePopularityStats(id);
  const { data: revenueStats, isLoading: revenueLoading } = useGameRevenueStats(id);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (gameLoading) return <CircularProgress />;
  if (gameError) return <Typography color="error">Error loading game: {gameError.message}</Typography>;
  if (!game) return <Typography>Game not found</Typography>;

  // Prepare chart data based on the stats
  const popularityChartData = {
    labels: popularityStats?.map(stat => new Date(stat.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Active Players',
        data: popularityStats?.map(stat => stat.activePlayers) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const revenueChartData = {
    labels: revenueStats?.map(stat => new Date(stat.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Revenue (USD)',
        data: revenueStats?.map(stat => stat.revenue) || [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
    ],
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Button 
          component={Link} 
          to="/games" 
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Games
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {game.title}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Game Details</Typography>
                <Typography><strong>Genre:</strong> {game.genre}</Typography>
                <Typography><strong>Release Date:</strong> {new Date(game.releaseDate).toLocaleDateString()}</Typography>
                <Typography><strong>Developer:</strong> {game.developer}</Typography>
                <Typography><strong>Publisher:</strong> {game.publisher}</Typography>
                <Typography sx={{ mt: 2 }}>{game.description}</Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to={`/games/edit/${game.id}`}
                    sx={{ mr: 2 }}
                  >
                    Edit Game
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Popularity" />
                  <Tab label="Revenue" />
                </Tabs>
                
                <Divider sx={{ my: 2 }} />
                
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Popularity Stats</Typography>
                    {popularityLoading ? (
                      <CircularProgress />
                    ) : popularityStats && popularityStats.length > 0 ? (
                      <Line data={popularityChartData} />
                    ) : (
                      <Typography>No popularity data available</Typography>
                    )}
                  </Box>
                )}
                
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Revenue Stats</Typography>
                    {revenueLoading ? (
                      <CircularProgress />
                    ) : revenueStats && revenueStats.length > 0 ? (
                      <Line data={revenueChartData} />
                    ) : (
                      <Typography>No revenue data available</Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default GameDetail;