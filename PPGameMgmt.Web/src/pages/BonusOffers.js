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
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { bonusApi } from "../services/api";

const BonusOffers = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        setLoading(true);
        const response = await bonusApi.getAll();
        setBonuses(response.data);
      } catch (err) {
        console.error("Error fetching bonuses:", err);
        setError("Failed to load bonuses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBonuses();
  }, []);

  const getBonusTypeColor = (type) => {
    switch (type) {
      case 'FreeSpins':
        return 'primary';
      case 'MatchDeposit':
        return 'success';
      case 'Cashback':
        return 'secondary';
      case 'NoDeposit':
        return 'warning';
      default:
        return 'default';
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
        Bonus Offers
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and claim available bonuses for your players
      </Typography>

      <Grid container spacing={3}>
        {bonuses.map((bonus) => (
          <Grid item xs={12} sm={6} md={4} key={bonus.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 140,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  typography: 'h5',
                  fontWeight: 'bold'
                }}
              >
                {bonus.name}
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip 
                    label={bonus.type} 
                    color={getBonusTypeColor(bonus.type)}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {bonus.isActive ? "Active" : "Inactive"}
                  </Typography>
                </Box>
                <Typography variant="h6" component="div">
                  {bonus.value} {bonus.valueType}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                  {bonus.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                    Available for: {bonus.playerSegments.join(", ")}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Valid until: {new Date(bonus.expiryDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button variant="contained" color="primary" fullWidth>
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BonusOffers;