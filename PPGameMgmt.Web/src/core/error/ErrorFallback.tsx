import React from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100%"
      p={3}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          width: '100%',
          textAlign: 'center' 
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Something went wrong
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph>
          {error?.message || 'An unexpected error occurred.'}
        </Typography>
        
        {resetError && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetError}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        )}
        
        <Button 
          variant="text" 
          onClick={() => window.location.href = '/'}
          sx={{ mt: 2, ml: resetError ? 2 : 0 }}
        >
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
};