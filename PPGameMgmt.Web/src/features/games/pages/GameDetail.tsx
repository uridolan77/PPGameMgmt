import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Skeleton,
  Tab,
  Tabs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useStore } from '../../../core/store';

// Mock data with the same structure as in GamesList
const mockGames = [
  { 
    id: '1', 
    name: 'Mystic Fortune', 
    provider: 'PlayWise', 
    category: 'Slots', 
    type: 'Video Slot',
    releaseDate: '2023-05-15',
    popularity: 4.8,
    status: 'active',
    description: 'A mystical adventure through ancient ruins in search of hidden treasures. This 5-reel slot features wild symbols, free spins, and a bonus game where players can win up to 5000x their stake.',
    features: ['Wild Symbols', 'Free Spins', 'Bonus Game', 'Multipliers'],
    rtp: 96.5,
    volatility: 'High',
    minBet: 0.10,
    maxBet: 100,
    maxWin: '5000x',
    platforms: ['Desktop', 'Mobile', 'Tablet'],
    languages: ['English', 'German', 'Spanish', 'French']
  },
  // More mock games would be here...
];

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ui } = useStore();
  
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        const foundGame = mockGames.find(g => g.id === id);
        
        if (foundGame) {
          setGame(foundGame);
        } else {
          ui.addNotification({
            type: 'error',
            message: 'Game not found',
            autoClose: true
          });
          navigate('/games');
        }
      } catch (error) {
        ui.addNotification({
          type: 'error',
          message: 'Failed to load game details',
          autoClose: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, navigate, ui]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderHeader = () => (
    <Box mb={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/games')}
        sx={{ mb: 2 }}
      >
        Back to Games
      </Button>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          {loading ? <Skeleton width={300} /> : game?.name}
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
            onClick={() => navigate(`/games/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              // Show confirmation dialog in a real app
              ui.addNotification({
                type: 'warning',
                message: 'This action would delete the game (demo only)',
                autoClose: true
              });
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Skeleton height={30} width="40%" />
      ) : (
        <Box display="flex" alignItems="center" mb={1}>
          <Chip 
            label={game?.status === 'active' ? 'Active' : game?.status === 'maintenance' ? 'Maintenance' : 'Inactive'}
            color={game?.status === 'active' ? 'success' : game?.status === 'maintenance' ? 'warning' : 'error'}
            size="small"
            sx={{ mr: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            {game?.provider} • {game?.category} • {game?.type}
          </Typography>
        </Box>
      )}
    </Box>
  );
  
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1">
            {loading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton width="80%" />
              </>
            ) : (
              game?.description
            )}
          </Typography>
          
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Features</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {loading ? (
                Array.from(new Array(4)).map((_, index) => (
                  <Skeleton key={index} width={80} height={32} />
                ))
              ) : (
                game?.features.map((feature: string) => (
                  <Chip key={feature} label={feature} />
                ))
              )}
            </Box>
          </Box>
        </Paper>
        
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Game Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">RTP</Typography>
              <Typography variant="body1" fontWeight="medium">
                {loading ? <Skeleton width={40} /> : `${game?.rtp}%`}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Volatility</Typography>
              <Typography variant="body1" fontWeight="medium">
                {loading ? <Skeleton width={60} /> : game?.volatility}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Min Bet</Typography>
              <Typography variant="body1" fontWeight="medium">
                {loading ? <Skeleton width={40} /> : `$${game?.minBet}`}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Max Bet</Typography>
              <Typography variant="body1" fontWeight="medium">
                {loading ? <Skeleton width={60} /> : `$${game?.maxBet}`}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardHeader title="Game Info" />
          <Divider />
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <CategoryIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Category</Typography>
                <Typography variant="body1">
                  {loading ? <Skeleton width={80} /> : game?.category}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Release Date</Typography>
                <Typography variant="body1">
                  {loading ? <Skeleton width={100} /> : new Date(game?.releaseDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <StarIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Popularity</Typography>
                <Typography variant="body1">
                  {loading ? <Skeleton width={60} /> : `${game?.popularity}/5.0`}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center">
              <VisibilityIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Max Win</Typography>
                <Typography variant="body1">
                  {loading ? <Skeleton width={70} /> : game?.maxWin}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={1}>
          <CardHeader title="Availability" />
          <Divider />
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Platforms</Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {loading ? (
                Array.from(new Array(3)).map((_, index) => (
                  <Skeleton key={index} width={70} height={32} />
                ))
              ) : (
                game?.platforms.map((platform: string) => (
                  <Chip key={platform} label={platform} size="small" />
                ))
              )}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>Languages</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {loading ? (
                Array.from(new Array(4)).map((_, index) => (
                  <Skeleton key={index} width={60} height={32} />
                ))
              ) : (
                game?.languages.map((language: string) => (
                  <Chip key={language} label={language} size="small" />
                ))
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {renderHeader()}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="game details tabs"
        >
          <Tab label="Overview" id="tab-0" />
          <Tab label="Performance" id="tab-1" />
          <Tab label="Settings" id="tab-2" />
        </Tabs>
      </Box>
      
      <div role="tabpanel" hidden={activeTab !== 0}>
        {activeTab === 0 && renderOverviewTab()}
      </div>
      <div role="tabpanel" hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Game Performance</Typography>
            <Typography>Performance metrics would be displayed here.</Typography>
          </Paper>
        )}
      </div>
      <div role="tabpanel" hidden={activeTab !== 2}>
        {activeTab === 2 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Game Settings</Typography>
            <Typography>Settings and configuration options would be displayed here.</Typography>
          </Paper>
        )}
      </div>
    </Container>
  );
};

export default GameDetail;