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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        // Call appropriate API endpoint based on filters
        if (searchTerm) {
          response = await gameApi.getAll({ search: searchTerm });
        } else if (gameCategory) {
          response = await gameApi.getByCategory(gameCategory);
        } else {
          response = await gameApi.getAll();
        }
        
        // Get the games from the response
        let fetchedGames = response.data;
        
        // Apply additional client-side filtering for type if needed
        // (ideally this would be handled by the backend)
        if (gameType && fetchedGames.length > 0) {
          fetchedGames = fetchedGames.filter(game => game.type === gameType);
        }
        
        // Calculate total pages
        setTotalPages(Math.ceil(fetchedGames.length / gamesPerPage));
        
        // Get current page of games
        const startIndex = (page - 1) * gamesPerPage;
        const endIndex = startIndex + gamesPerPage;
        const paginatedGames = fetchedGames.slice(startIndex, endIndex);
        
        setGames(paginatedGames);
      } catch (error) {
        console.error("Error fetching games:", error);
        setError(error.friendlyMessage || "Failed to load games. Please try again.");
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