import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOutlined as LockIcon } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
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
          <Box 
            sx={{
              backgroundColor: 'error.light',
              color: 'error.contrastText',
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <LockIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }}
          >
            You do not have permission to access this page.
            Please contact your administrator if you believe this is an error.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/')}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;