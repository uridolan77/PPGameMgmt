import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Chip,
  Paper
} from '@mui/material';
import { useGame, useCreateGame, useUpdateGame } from '../hooks';

// Game form input types
interface GameFormInputs {
  id?: string;
  name: string;
  provider: string;
  category: string;
  type: string;
  releaseDate: string;
  description: string;
  genre: string;
  developer: string;
  publisher: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  maxWin: string;
  status: 'active' | 'inactive' | 'maintenance';
  features: string[];
  platforms: string[];
  languages: string[];
}

interface GameFormProps {
  gameId?: string;
}

const GameForm: React.FC<GameFormProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  
  // Fetch game data if editing an existing game
  const { data: gameData, isLoading } = useGame(gameId);
  
  // Form hooks
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<GameFormInputs>({
    defaultValues: {
      status: 'active',
      rtp: 96,
      volatility: 'Medium',
      minBet: 0.1,
      maxBet: 100,
      features: [],
      platforms: ['Desktop', 'Mobile', 'Tablet'],
      languages: ['English']
    }
  });
  
  // Mutations for creating/updating games
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  
  // Set form values when game data is loaded
  React.useEffect(() => {
    if (gameData) {
      reset({
        ...gameData,
        releaseDate: gameData.releaseDate.substring(0, 10) // Format as YYYY-MM-DD
      });
      
      if (gameData.features) {
        setFeatures(gameData.features);
      }
    }
  }, [gameData, reset]);
  
  // Handle form submission
  const onSubmit: SubmitHandler<GameFormInputs> = (data) => {
    const gameDataWithFeatures = {
      ...data,
      features
    };
    
    if (gameId) {
      updateGame.mutate(
        { id: gameId, gameData: gameDataWithFeatures },
        {
          onSuccess: () => navigate(`/games/${gameId}`)
        }
      );
    } else {
      createGame.mutate(gameDataWithFeatures, {
        onSuccess: (newGame) => navigate(`/games/${newGame.id}`)
      });
    }
  };
  
  // Feature handling
  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };
  
  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };
  
  if (isLoading) {
    return <Box p={3}>Loading game data...</Box>;
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {gameId ? 'Edit Game' : 'Create New Game'}
        </Typography>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Game Name"
                {...register('name', { required: 'Game name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Provider"
                {...register('provider', { required: 'Provider is required' })}
                error={!!errors.provider}
                helperText={errors.provider?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal" error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  {...register('category', { required: 'Category is required' })}
                >
                  <MenuItem value="Slots">Slots</MenuItem>
                  <MenuItem value="Table Games">Table Games</MenuItem>
                  <MenuItem value="Live Casino">Live Casino</MenuItem>
                  <MenuItem value="Video Poker">Video Poker</MenuItem>
                  <MenuItem value="Instant Win">Instant Win</MenuItem>
                </Select>
                {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal" error={!!errors.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  {...register('type', { required: 'Type is required' })}
                >
                  <MenuItem value="Video Slot">Video Slot</MenuItem>
                  <MenuItem value="Classic Slot">Classic Slot</MenuItem>
                  <MenuItem value="Blackjack">Blackjack</MenuItem>
                  <MenuItem value="Roulette">Roulette</MenuItem>
                  <MenuItem value="Game Show">Game Show</MenuItem>
                  <MenuItem value="Card Game">Card Game</MenuItem>
                  <MenuItem value="Adventure Slot">Adventure Slot</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Release Date"
                InputLabelProps={{ shrink: true }}
                {...register('releaseDate', { required: 'Release date is required' })}
                error={!!errors.releaseDate}
                helperText={errors.releaseDate?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Developer"
                {...register('developer')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Publisher"
                {...register('publisher')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                helperText={errors.description?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Game Configuration</Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="RTP (%)"
                InputProps={{ inputProps: { min: 80, max: 99, step: 0.1 } }}
                {...register('rtp', { 
                  required: 'RTP is required', 
                  min: { value: 80, message: 'Min RTP is 80%' },
                  max: { value: 99, message: 'Max RTP is 99%' },
                  valueAsNumber: true
                })}
                error={!!errors.rtp}
                helperText={errors.rtp?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Volatility</InputLabel>
                <Select
                  label="Volatility"
                  {...register('volatility')}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Very High">Very High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Min Bet"
                InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                {...register('minBet', { 
                  required: 'Min bet is required',
                  min: { value: 0.01, message: 'Min bet must be at least 0.01' },
                  valueAsNumber: true
                })}
                error={!!errors.minBet}
                helperText={errors.minBet?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Max Bet"
                InputProps={{ inputProps: { min: 1, step: 1 } }}
                {...register('maxBet', { 
                  required: 'Max bet is required',
                  min: { value: 1, message: 'Max bet must be at least 1' },
                  valueAsNumber: true
                })}
                error={!!errors.maxBet}
                helperText={errors.maxBet?.message}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Max Win"
                {...register('maxWin')}
                margin="normal"
                placeholder="e.g. 5000x"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  {...register('status')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Game Features</Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label="Add Feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  sx={{ mr: 2 }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                >
                  Add
                </Button>
              </Box>
              
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                {features.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    onDelete={() => handleRemoveFeature(feature)}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/games')}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={createGame.isPending || updateGame.isPending}
                >
                  {createGame.isPending || updateGame.isPending
                    ? 'Saving...'
                    : gameId
                    ? 'Update Game'
                    : 'Create Game'
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default GameForm;