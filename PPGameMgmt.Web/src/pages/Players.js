import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Button, 
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { playerApi } from '../services/api';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const navigate = useNavigate();

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await playerApi.getAll();
        
        // Handle both array response or object with data property
        const playersData = Array.isArray(response) ? response : 
                           (response.data ? response.data : []);
        
        setPlayers(playersData);
        setFilteredPlayers(playersData);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to load players. Please try again later.');
        
        // Use mock data as fallback for development purposes
        const mockPlayers = [
          { 
            id: '1', 
            username: 'johndoe', 
            firstName: 'John', 
            lastName: 'Doe', 
            email: 'john@example.com',
            isActive: true,
            registrationDate: '2024-01-15T10:30:00',
            playerSegment: 'VIP'
          },
          { 
            id: '2', 
            username: 'janesmith', 
            firstName: 'Jane', 
            lastName: 'Smith', 
            email: 'jane@example.com',
            isActive: true,
            registrationDate: '2024-02-20T14:45:00',
            playerSegment: 'Regular'
          },
          { 
            id: '3', 
            username: 'mikebrown', 
            firstName: 'Mike', 
            lastName: 'Brown', 
            email: 'mike@example.com',
            isActive: false,
            registrationDate: '2023-11-05T08:15:00',
            playerSegment: 'Casual'
          },
          { 
            id: '4', 
            username: 'sarahwilson', 
            firstName: 'Sarah', 
            lastName: 'Wilson', 
            email: 'sarah@example.com',
            isActive: true,
            registrationDate: '2024-03-10T16:20:00',
            playerSegment: 'VIP'
          },
          { 
            id: '5', 
            username: 'davidlee', 
            firstName: 'David', 
            lastName: 'Lee', 
            email: 'david@example.com',
            isActive: true,
            registrationDate: '2023-12-18T11:50:00',
            playerSegment: 'Regular'
          }
        ];
        
        setPlayers(mockPlayers);
        setFilteredPlayers(mockPlayers);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Filter players when search term changes
  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = players.filter(player => 
        player.username?.toLowerCase().includes(lowercasedSearch) ||
        player.firstName?.toLowerCase().includes(lowercasedSearch) ||
        player.lastName?.toLowerCase().includes(lowercasedSearch) ||
        player.email?.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredPlayers(filtered);
      setPage(0); // Reset to first page when filtering
    } else {
      setFilteredPlayers(players);
    }
  }, [searchTerm, players]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewPlayer = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  const handleEditPlayer = (playerId) => {
    navigate(`/players/${playerId}/edit`);
  };

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playerApi.delete(playerId);
        setPlayers(players.filter(player => player.id !== playerId));
      } catch (err) {
        console.error('Error deleting player:', err);
        alert('Failed to delete player. Please try again.');
      }
    }
  };

  const getPlayerSegmentColor = (segment) => {
    switch(segment) {
      case 'VIP':
        return 'success';
      case 'Regular':
        return 'primary';
      case 'Casual':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Players
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link} 
          to="/players/new"
        >
          Add New Player
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search players by name, username, or email"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlayers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((player) => (
                    <TableRow key={player.id} hover>
                      <TableCell>{player.username}</TableCell>
                      <TableCell>{`${player.firstName} ${player.lastName}`}</TableCell>
                      <TableCell>{player.email}</TableCell>
                      <TableCell>
                        {new Date(player.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {player.isActive ? (
                          <Chip size="small" label="Active" color="success" />
                        ) : (
                          <Chip size="small" label="Inactive" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={player.playerSegment} 
                          color={getPlayerSegmentColor(player.playerSegment)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewPlayer(player.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleEditPlayer(player.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleDeletePlayer(player.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredPlayers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {searchTerm ? 'No players found matching your search' : 'No players available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPlayers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default Players;