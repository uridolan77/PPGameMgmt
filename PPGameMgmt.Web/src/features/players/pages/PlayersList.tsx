import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Chip, Avatar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { usePlayers } from '../hooks';
import { useStore } from '../../../core/store';

interface Player {
  id: number;
  username: string;
  email: string;
  playerLevel: number;
  isActive: boolean;
  segment?: string;
  lastLogin?: string;
}

const PlayersList: React.FC = () => {
  const navigate = useNavigate();
  const { data: players, isLoading, isError } = usePlayers();
  const { preferences } = useStore();
  const tablePreference = preferences.tablePreferences.players;

  const handleRowClick = (player: Player) => {
    navigate(`/players/${player.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const columns: Column<Player>[] = [
    {
      id: 'username',
      label: 'Username',
      renderCell: (player) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2,
              bgcolor: `${getAvatarColor(player.username)}`
            }}
          >
            {player.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {player.username}
          </Typography>
        </Box>
      ),
    },
    { 
      id: 'email', 
      label: 'Email' 
    },
    {
      id: 'playerLevel',
      label: 'Level',
      align: 'center',
      renderCell: (player) => (
        <Chip
          label={`Level ${player.playerLevel}`}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'segment',
      label: 'Segment',
      renderCell: (player) => (
        player.segment ? (
          <Chip
            label={player.segment}
            size="small"
            color="primary"
            variant="outlined"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        )
      ),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      renderCell: (player) => (
        <Typography variant="body2">
          {formatDate(player.lastLogin)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      renderCell: (player) => (
        <Chip
          label={player.isActive ? 'Active' : 'Inactive'}
          color={player.isActive ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
  ];

  // Generate a consistent color from a string
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Players
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/players/new')}
        >
          Add New Player
        </Button>
      </Box>

      <DataTable<Player>
        data={players || []}
        columns={columns}
        keyExtractor={(item) => item.id.toString()}
        onRowClick={handleRowClick}
        initialSortBy="username"
        searchable={true}
        pagination={true}
        dense={tablePreference?.density === 'compact'}
        stickyHeader
      />
    </Container>
  );
};

export default PlayersList;