import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  CircularProgress,
  Button
} from "@mui/material";
import { Search as SearchIcon, Casino as CasinoIcon } from "@mui/icons-material";
import { gameApi } from "../services/api";

const GameLibrary = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gameType, setGameType] = useState("");
  const [gameCategory, setGameCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const gamesPerPage = 12;

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch filtered games from the API
        // const response = await gameApi.getAll({
        //   type: gameType,
        //   category: gameCategory,
        //   search: searchTerm,
        //   page,
        //   pageSize: gamesPerPage
        // });
        
        // For demo purposes, we'll use mock data
        // Simulate API response time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock game data
        const mockGames = [
          {
            id: "1",
            name: "Buffalo Blitz",
            provider: "Playtech",
            type: "Slot",
            category: "Popular",
            description: "Roam the plains with the mighty buffalo in this exciting slot game with 6 reels and 4,096 ways to win.",
            releasedAt: "2020-05-15",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Buffalo+Blitz",
            popularityRank: 1,
            rtp: 95.96
          },
          {
            id: "2",
            name: "Blackjack Pro",
            provider: "Evolution Gaming",
            type: "Table",
            category: "Card",
            description: "Experience the classic casino card game with professional dealers and multiple side bets.",
            releasedAt: "2019-08-22",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Blackjack+Pro",
            popularityRank: 3,
            rtp: 99.54
          },
          {
            id: "3",
            name: "Mega Fortune",
            provider: "NetEnt",
            type: "Slot",
            category: "Progressive",
            description: "Live the lifestyle of the rich and famous with this luxury-themed progressive slot.",
            releasedAt: "2021-02-10",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Mega+Fortune",
            popularityRank: 5,
            rtp: 96.6
          },
          {
            id: "4",
            name: "Roulette Live",
            provider: "Evolution Gaming",
            type: "LiveDealer",
            category: "Live",
            description: "Authentic live roulette experience with real dealers and multiple camera angles.",
            releasedAt: "2020-11-05",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Roulette+Live",
            popularityRank: 2,
            rtp: 97.3
          },
          {
            id: "5",
            name: "Book of Ra",
            provider: "Novomatic",
            type: "Slot",
            category: "Adventure",
            description: "Join the explorer on his quest to find the mystical Book of Ra in ancient Egypt.",
            releasedAt: "2019-04-18",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Book+of+Ra",
            popularityRank: 4,
            rtp: 95.1
          },
          {
            id: "6",
            name: "Poker Texas Hold'em",
            provider: "Playtech",
            type: "Table",
            category: "Card",
            description: "The most popular poker variant with simple rules and exciting gameplay.",
            releasedAt: "2020-07-22",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Poker+Texas",
            popularityRank: 6,
            rtp: 97.8
          },
          {
            id: "7",
            name: "Gonzo's Quest",
            provider: "NetEnt",
            type: "Slot",
            category: "Adventure",
            description: "Join Gonzo on his quest for El Dorado with avalanche reels and increasing multipliers.",
            releasedAt: "2018-09-12",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Gonzos+Quest",
            popularityRank: 7,
            rtp: 96.0
          },
          {
            id: "8",
            name: "Baccarat Pro",
            provider: "Evolution Gaming",
            type: "Table",
            category: "Card",
            description: "Elegant and simple card game with three possible outcomes: player win, banker win, or tie.",
            releasedAt: "2019-12-01",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Baccarat+Pro",
            popularityRank: 9,
            rtp: 98.94
          },
          {
            id: "9",
            name: "Starburst",
            provider: "NetEnt",
            type: "Slot",
            category: "Space",
            description: "A dazzling slot game with expanding wilds and respins set in a colorful cosmic environment.",
            releasedAt: "2018-05-30",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Starburst",
            popularityRank: 8,
            rtp: 96.1
          },
          {
            id: "10",
            name: "Craps Live",
            provider: "Evolution Gaming",
            type: "LiveDealer",
            category: "Dice",
            description: "Live dealer craps game with multiple betting options and authentic casino atmosphere.",
            releasedAt: "2021-03-15",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Craps+Live",
            popularityRank: 12,
            rtp: 98.64
          },
          {
            id: "11",
            name: "Wolf Gold",
            provider: "Pragmatic Play",
            type: "Slot",
            category: "Wildlife",
            description: "Roam the American wilderness with wolves, bison, and eagles in this 5-reel slot.",
            releasedAt: "2020-02-10",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Wolf+Gold",
            popularityRank: 10,
            rtp: 96.01
          },
          {
            id: "12",
            name: "Caribbean Stud Poker",
            provider: "Playtech",
            type: "Table",
            category: "Card",
            description: "Five-card poker variant where player competes against the dealer with a progressive jackpot.",
            releasedAt: "2019-10-08",
            thumbnailUrl: "https://via.placeholder.com/300x200?text=Caribbean+Poker",
            popularityRank: 15,
            rtp: 94.78
          }
        ];
        
        // Apply filters for demo (normally done on the server)
        let filteredGames = [...mockGames];
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredGames = filteredGames.filter(game => 
            game.name.toLowerCase().includes(searchLower) || 
            game.provider.toLowerCase().includes(searchLower) ||
            game.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (gameType) {
          filteredGames = filteredGames.filter(game => game.type === gameType);
        }
        
        if (gameCategory) {
          filteredGames = filteredGames.filter(game => game.category === gameCategory);
        }
        
        // Calculate total pages
        setTotalPages(Math.ceil(filteredGames.length / gamesPerPage));
        
        // Get current page of games
        const startIndex = (page - 1) * gamesPerPage;
        const endIndex = startIndex + gamesPerPage;
        const paginatedGames = filteredGames.slice(startIndex, endIndex);
        
        setGames(paginatedGames);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [searchTerm, gameType, gameCategory, page]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleTypeChange = (event) => {
    setGameType(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setGameCategory(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getGameTypeChipColor = (type) => {
    switch(type) {
      case "Slot":
        return "primary";
      case "Table":
        return "secondary";
      case "LiveDealer":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Game Library
      </Typography>
      
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Games"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="game-type-label">Game Type</InputLabel>
              <Select
                labelId="game-type-label"
                value={gameType}
                onChange={handleTypeChange}
                label="Game Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Slot">Slot</MenuItem>
                <MenuItem value="Table">Table</MenuItem>
                <MenuItem value="LiveDealer">Live Dealer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="game-category-label">Category</InputLabel>
              <Select
                labelId="game-category-label"
                value={gameCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Popular">Popular</MenuItem>
                <MenuItem value="Progressive">Progressive</MenuItem>
                <MenuItem value="Adventure">Adventure</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="Live">Live</MenuItem>
                <MenuItem value="Space">Space</MenuItem>
                <MenuItem value="Dice">Dice</MenuItem>
                <MenuItem value="Wildlife">Wildlife</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : games.length === 0 ? (
        <Box textAlign="center" p={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No games found matching your criteria
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => {
              setSearchTerm("");
              setGameType("");
              setGameCategory("");
              setPage(1);
            }}
            startIcon={<CasinoIcon />}
          >
            Show All Games
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.thumbnailUrl || `https://via.placeholder.com/300x200?text=${encodeURIComponent(game.name)}`}
                    alt={game.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography gutterBottom variant="h6" component="h2" noWrap sx={{ maxWidth: '70%' }}>
                        {game.name}
                      </Typography>
                      <Chip 
                        label={game.type} 
                        size="small" 
                        color={getGameTypeChipColor(game.type)}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {game.provider}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2
                    }}>
                      {game.description}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={game.category} 
                        variant="outlined" 
                        size="small"
                      />
                      <Typography variant="body2" color="primary">
                        RTP: {game.rtp}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default GameLibrary;