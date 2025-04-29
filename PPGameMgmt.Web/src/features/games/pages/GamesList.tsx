import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Chip, Avatar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { useStore } from '../../../core/store';

interface Game {
  id: string;
  name: string;
  provider: string;
  category: string;
  type: string;
  releaseDate: string;
  popularity: number;
  status: 'active' | 'inactive' | 'maintenance';
}

// Mock data for demonstration
const mockGames: Game[] = [
  { 
    id: '1', 
    name: 'Mystic Fortune', 
    provider: 'PlayWise', 
    category: 'Slots', 
    type: 'Video Slot',
    releaseDate: '2023-05-15',
    popularity: 4.8,
    status: 'active'
  },
  { 
    id: '2', 
    name: 'Royal Blackjack', 
    provider: 'CardMasters', 
    category: 'Table Games', 
    type: 'Card Game',
    releaseDate: '2023-02-10',
    popularity: 4.5,
    status: 'active'
  },
  { 
    id: '3', 
    name: 'Mega Wheel', 
    provider: 'SpinTech', 
    category: 'Live Casino', 
    type: 'Game Show',
    releaseDate: '2023-08-22',
    popularity: 4.2,
    status: 'active'
  },
  { 
    id: '4', 
    name: 'Treasure Hunt', 
    provider: 'PlayWise', 
    category: 'Slots', 
    type: 'Adventure Slot',
    releaseDate: '2022-11-30',
    popularity: 4.6,
    status: 'maintenance'
  },
  { 
    id: '5', 
    name: 'European Roulette', 
    provider: 'RouletteKings', 
    category: 'Table Games', 
    type: 'Roulette',
    releaseDate: '2022-09-05',
    popularity: 4.3,
    status: 'active'
  },
  { 
    id: '6', 
    name: 'Dragon's Lair', 
    provider: 'MythicGames', 
    category: 'Slots', 
    type: 'Video Slot',
    releaseDate: '2023-01-15',
    popularity: 3.9,
    status: 'inactive'
  },
];

const GamesList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { preferences } = useStore();
  const tablePreference = preferences.tablePreferences.games;

  useEffect(() => {
    // Simulate API call
    const fetchGames = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setGames(mockGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleRowClick = (game: Game) => {
    navigate(`/games/${game.id}`);
  };

  const columns: Column<Game>[] = [
    {
      id: 'name',
      label: 'Game Name',
      renderCell: (game) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            variant="rounded"
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2,
              bgcolor: `#${Math.floor(Math.random()*16777215).toString(16)}`
            }}
          >
            {game.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {game.name}
          </Typography>
        </Box>
      ),
    },
    { id: 'provider', label: 'Provider' },
    { id: 'category', label: 'Category' },
    { id: 'type', label: 'Type' },
    {
      id: 'popularity',
      label: 'Popularity',
      align: 'right',
      renderCell: (game) => (
        <Typography variant="body2">
          {game.popularity.toFixed(1)}/5.0
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      renderCell: (game) => {
        const statusConfig = {
          active: { color: 'success', label: 'Active' },
          inactive: { color: 'error', label: 'Inactive' },
          maintenance: { color: 'warning', label: 'Maintenance' },
        };
        
        const config = statusConfig[game.status];
        
        return (
          <Chip 
            label={config.label} 
            size="small"
            color={config.color as 'success' | 'error' | 'warning'}
            variant="outlined"
          />
        );
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Games Library
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/games/new')}
        >
          Add New Game
        </Button>
      </Box>

      <DataTable<Game>
        data={games}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
        initialSortBy="name"
        searchable={true}
        pagination={true}
        dense={tablePreference?.density === 'compact'}
        stickyHeader
      />
    </Container>
  );
};

export default GamesList;