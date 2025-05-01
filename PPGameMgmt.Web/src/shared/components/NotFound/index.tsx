import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon, Refresh as RefreshIcon, Error as ErrorIcon } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Extract the path that wasn't found
  const path = location.pathname;

  // Check if this is a known route with potential issues
  const isKnownRoute = path.includes('/players') || path.includes('/games') || path.includes('/bonuses');

  // Attempt to reload the page
  const handleRetry = () => {
    setIsLoading(true);
    setErrorDetails(null);

    // Simulate loading
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Log error information
  useEffect(() => {
    console.error(`NotFound component rendered for path: ${path}`);

    // Check for specific issues based on the path
    if (path.includes('/players')) {
      setErrorDetails('The Players page could not be loaded. This might be due to an API connection issue or missing components.');
    } else if (path.includes('/games')) {
      setErrorDetails('The Games page could not be loaded. This might be due to an API connection issue or missing components.');
    }
  }, [path]);

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <ErrorIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '3rem', md: '4rem' },
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              404
            </Typography>
          </Box>

          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            The page <strong>{path}</strong> could not be found or has been moved.
          </Typography>

          {errorDetails && (
            <Box sx={{ mt: 2, mb: 3, textAlign: 'left', bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="error.contrastText">
                {errorDetails}
              </Typography>
            </Box>
          )}

          {isKnownRoute && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">SUGGESTIONS</Typography>
              </Divider>

              <List sx={{ textAlign: 'left', mb: 3 }}>
                <ListItem>
                  <ListItemIcon>
                    <RefreshIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Try refreshing the page"
                    secondary="This may resolve temporary loading issues"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ArrowBackIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Go back and try again"
                    secondary="The previous page might have more information"
                  />
                </ListItem>
              </List>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Go Back
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <HomeIcon />}
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Dashboard
            </Button>

            {isKnownRoute && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={handleRetry}
                disabled={isLoading}
              >
                {isLoading ? 'Reloading...' : 'Retry'}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;