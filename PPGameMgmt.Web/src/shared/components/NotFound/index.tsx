import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 4 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            borderRadius: 2, 
            width: '100%', 
            maxWidth: 600 
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '4rem', md: '6rem' }, 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }}
          >
            The page you are looking for does not exist or has been moved.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;