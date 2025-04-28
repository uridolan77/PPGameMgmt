import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import { recommendationApi } from "../services/api";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recommendations-tabpanel-${index}`}
      aria-labelledby={`recommendations-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Recommendations = () => {
  const [value, setValue] = useState(0);
  const [gameRecommendations, setGameRecommendations] = useState([]);
  const [bonusRecommendation, setBonusRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState("current"); // This would usually come from auth context

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        try {
          // Get game recommendations
          const gamesResponse = await recommendationApi.getGameRecommendations(playerId);
          setGameRecommendations(Array.isArray(gamesResponse) ? gamesResponse : 
                               (gamesResponse.data ? gamesResponse.data : []));
        } catch (gameErr) {
          console.error("Error fetching game recommendations:", gameErr);
          
          // Mock game recommendations as fallback
          const mockGameRecommendations = [
            {
              id: "rec1",
              game: {
                id: "game1",
                name: "Buffalo Blitz",
                imageUrl: "https://via.placeholder.com/300x140?text=Buffalo+Blitz",
                description: "Roam the plains with the mighty buffalo in this exciting slot game with 6 reels and 4,096 ways to win."
              },
              matchScore: 92,
              reasonCode: "SIMILAR_PLAYED"
            },
            {
              id: "rec2",
              game: {
                id: "game2",
                name: "Blackjack Pro",
                imageUrl: "https://via.placeholder.com/300x140?text=Blackjack+Pro",
                description: "Experience the classic casino card game with professional dealers and multiple side bets."
              },
              matchScore: 88,
              reasonCode: "FREQUENT_PLAYED"
            },
            {
              id: "rec3",
              game: {
                id: "game3",
                name: "Mega Fortune",
                imageUrl: "https://via.placeholder.com/300x140?text=Mega+Fortune",
                description: "Live the lifestyle of the rich and famous with this luxury-themed progressive slot."
              },
              matchScore: 85,
              reasonCode: "SIMILAR_PLAYED"
            },
            {
              id: "rec4",
              game: {
                id: "game4",
                name: "Roulette Live",
                imageUrl: "https://via.placeholder.com/300x140?text=Roulette+Live",
                description: "Authentic live roulette experience with real dealers and multiple camera angles."
              },
              matchScore: 81,
              reasonCode: "SIMILAR_PLAYERS"
            },
            {
              id: "rec5",
              game: {
                id: "game5",
                name: "Book of Ra",
                imageUrl: "https://via.placeholder.com/300x140?text=Book+of+Ra",
                description: "Join the explorer on his quest to find the mystical Book of Ra in ancient Egypt."
              },
              matchScore: 78,
              reasonCode: "SIMILAR_PLAYERS"
            },
            {
              id: "rec6",
              game: {
                id: "game6",
                name: "Starburst",
                imageUrl: "https://via.placeholder.com/300x140?text=Starburst",
                description: "A dazzling slot game with expanding wilds and respins set in a colorful cosmic environment."
              },
              matchScore: 76,
              reasonCode: "NEW_RELEASE"
            }
          ];
          
          setGameRecommendations(mockGameRecommendations);
        }
        
        try {
          // Get bonus recommendation
          const bonusResponse = await recommendationApi.getBonusRecommendations(playerId);
          setBonusRecommendation(bonusResponse.data);
        } catch (bonusErr) {
          console.error("Error fetching bonus recommendations:", bonusErr);
          
          // Mock bonus recommendation as fallback
          const mockBonusRecommendation = {
            id: "brec1",
            bonus: {
              id: "bonus1",
              name: "Personalized Weekend Reload",
              value: "75%",
              valueType: "match deposit",
              description: "Get a 75% match on your next deposit this weekend, tailored to your playing style."
            },
            matchScore: 94,
            reasonCode: "PLAYING_PATTERN"
          };
          
          setBonusRecommendation(mockBonusRecommendation);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [playerId]);

  const handleRecordClick = async (recommendationId) => {
    try {
      // We'd normally call the API here, but we'll handle the error silently for now
      // await recommendationApi.recordClick(recommendationId);
      console.log(`Clicked recommendation: ${recommendationId}`);
    } catch (err) {
      console.error("Error recording recommendation click:", err);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ my: 3 }}>
        Personalized Recommendations
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Games and bonuses tailored to your preferences and playing style
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="recommendation tabs">
          <Tab label="Game Recommendations" id="recommendations-tab-0" />
          <Tab label="Bonus Offers" id="recommendations-tab-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <Grid container spacing={3}>
          {gameRecommendations.map((recommendation) => (
            <Grid item xs={12} sm={6} md={4} key={recommendation.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                } 
              }}>
                <CardMedia
                  component="img"
                  sx={{ height: 140 }}
                  image={recommendation.game.imageUrl || "https://via.placeholder.com/300x140?text=Game"}
                  alt={recommendation.game.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {recommendation.game.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {recommendation.game.description?.slice(0, 100)}...
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {recommendation.matchScore}% match to your preferences
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    size="medium" 
                    onClick={() => handleRecordClick(recommendation.id)}
                    fullWidth
                  >
                    Play Now
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        {bonusRecommendation ? (
          <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardMedia
              component="div"
              sx={{
                height: 140,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                typography: 'h5',
                fontWeight: 'bold'
              }}
            >
              {bonusRecommendation.bonus.name}
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {bonusRecommendation.bonus.value} {bonusRecommendation.bonus.valueType}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {bonusRecommendation.bonus.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  {bonusRecommendation.matchScore}% match to your play style
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={() => handleRecordClick(bonusRecommendation.id)}
                >
                  Claim Bonus
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
            No bonus recommendations available at this time.
          </Typography>
        )}
      </TabPanel>
    </Container>
  );
};

export default Recommendations;