import React from 'react';
import { useGames, useDeleteGame } from '../../hooks/useGames';
import { 
  Container, 
  Typography, 
  Button,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const GamesList = () => {
  // Use our React Query hooks
  const { data: games, isLoading, error } = useGames();
  const deleteGame = useDeleteGame();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      deleteGame.mutate(id);
    }
  };

  if (isLoading) return <CircularProgress />;

  if (error) return <Typography color="error">Error loading games: {error.message}</Typography>;

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Games
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        to="/games/new"
        sx={{ mb: 3 }}
      >
        Add New Game
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Genre</TableCell>
              <TableCell>Release Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games?.length > 0 ? (
              games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell component={Link} to={`/games/${game.id}`} sx={{ textDecoration: 'none' }}>
                    {game.title}
                  </TableCell>
                  <TableCell>{game.genre}</TableCell>
                  <TableCell>{new Date(game.releaseDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton component={Link} to={`/games/edit/${game.id}`}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(game.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No games available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default GamesList;