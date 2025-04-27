import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Rating,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Casino as GameIcon,
  CardGiftcard as BonusIcon,
  Refresh as RefreshIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@mui/icons-material";
import { recommendationApi } from "../../services/api";

const PlayerRecommendations = ({ playerId, recommendations: initialRecommendations }) => {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recommendationApi.getRecommendation(playerId);
      setRecommendations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      setError("Failed to refresh recommendations. Please try again.");
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFeedback = async (recommendationId, isPositive) => {
    try {
      await recommendationApi.submitFeedback(recommendationId, isPositive);
      // Optimistic update - we could update the UI to reflect the feedback
      // without waiting for a refresh from the server
    } catch (error) {
      console.error("Error submitting recommendation feedback:", error);
    }
  };

  // Mock data for game recommendations if not provided
  const gameRecommendations = recommendations?.games || [
    {
      id: "game1",
      name: "Starburst",
      type: "Slot",
      provider: "NetEnt",
      matchScore: 92,
      imageUrl: "https://via.placeholder.com/300x200?text=Starburst",
      reason: "Based on previous slot game preferences",
    },
    {
      id: "game2",
      name: "Gonzo's Quest",
      type: "Slot",
      provider: "NetEnt",
      matchScore: 88,
      imageUrl: "https://via.placeholder.com/300x200?text=Gonzos+Quest",
      reason: "Popular with similar players",
    },
    {
      id: "game3",
      name: "Book of Dead",
      type: "Slot",
      provider: "Play'n GO",
      matchScore: 85,
      imageUrl: "https://via.placeholder.com/300x200?text=Book+of+Dead",
      reason: "Based on theme preferences",
    },
    {
      id: "game4",
      name: "Blackjack Professional",
      type: "Table",
      provider: "Evolution",
      matchScore: 80,
      imageUrl: "https://via.placeholder.com/300x200?text=Blackjack",
      reason: "Based on past table game play",
    },
  ];

  // Mock data for bonus recommendations if not provided
  const bonusRecommendations = recommendations?.bonuses || [
    {
      id: "bonus1",
      name: "Weekend Reload 50%",
      type: "Deposit",
      value: 50,
      matchScore: 95,
      imageUrl: "https://via.placeholder.com/300x200?text=Weekend+Reload",
      reason: "Matches deposit patterns",
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    },
    {
      id: "bonus2",
      name: "Free Spins on Starburst",
      type: "Free Spins",
      value: 20,
      matchScore: 90,
      imageUrl: "https://via.placeholder.com/300x200?text=Free+Spins",
      reason: "Based on favorite games",
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    },
    {
      id: "bonus3",
      name: "Cashback 10%",
      type: "Cashback",
      value: 10,
      matchScore: 85,
      imageUrl: "https://via.placeholder.com/300x200?text=Cashback",
      reason: "Risk mitigation strategy",
      expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="recommendation tabs"
        >
          <Tab icon={<GameIcon />} label="GAMES" iconPosition="start" />
          <Tab icon={<BonusIcon />} label="BONUSES" iconPosition="start" />
        </Tabs>
        
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh Recommendations
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Game Recommendations Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {gameRecommendations.length > 0 ? (
            gameRecommendations.map((game) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.imageUrl}
                    alt={game.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom noWrap>
                        {game.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${game.matchScore}%`}
                        color={game.matchScore > 90 ? "success" : "primary"}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {game.provider}  {game.type}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {game.reason}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ mr: 1 }}
                      >
                        Play Now
                      </Button>
                      <Box>
                        <Tooltip title="Like recommendation">
                          <IconButton 
                            size="small"
                            onClick={() => handleFeedback(game.id, true)}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dislike recommendation">
                          <IconButton 
                            size="small"
                            onClick={() => handleFeedback(game.id, false)}
                          >
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No game recommendations available for this player.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Bonus Recommendations Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {bonusRecommendations.length > 0 ? (
            bonusRecommendations.map((bonus) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={bonus.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={bonus.imageUrl}
                    alt={bonus.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom noWrap>
                        {bonus.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${bonus.matchScore}%`}
                        color={bonus.matchScore > 90 ? "success" : "primary"}
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {bonus.type === "Deposit" ? `${bonus.value}%` : 
                         bonus.type === "Free Spins" ? `${bonus.value} Spins` : 
                         bonus.type === "Cashback" ? `${bonus.value}%` : `$${bonus.value}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {bonus.type}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Expires: {formatDate(bonus.expiresAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {bonus.reason}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ mr: 1 }}
                      >
                        Award Bonus
                      </Button>
                      <Box>
                        <Tooltip title="Like recommendation">
                          <IconButton 
                            size="small"
                            onClick={() => handleFeedback(bonus.id, true)}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dislike recommendation">
                          <IconButton 
                            size="small"
                            onClick={() => handleFeedback(bonus.id, false)}
                          >
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No bonus recommendations available for this player.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default PlayerRecommendations;