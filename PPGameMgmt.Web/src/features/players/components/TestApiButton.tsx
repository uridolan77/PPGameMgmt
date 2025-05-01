import React, { useState } from 'react';
import { Button, Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { playerApi } from '../services';

const TestApiButton: React.FC = () => {
  const [directApiResponse, setDirectApiResponse] = useState<any>(null);
  const [serviceApiResponse, setServiceApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testDirectApi = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Testing direct API connection...');

      // Test direct fetch with the exact URL format
      const response = await fetch('https://localhost:7210/api/Players?api-version=1.0');
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Direct API data:', data);
        setDirectApiResponse(data);
      } else {
        console.error('API error:', response.statusText);
        setError(`API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('API fetch error:', error);
      setError(`API fetch error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testServiceApi = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Testing service API connection...');

      // Test the playerApi service
      const data = await playerApi.getAll();
      console.log('Service API data:', data);
      setServiceApiResponse(data);
    } catch (error) {
      console.error('Service API error:', error);
      setError(`Service API error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={testDirectApi}
            disabled={loading}
          >
            {loading ? 'Testing Direct...' : 'Test Direct API'}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={testServiceApi}
            disabled={loading}
          >
            {loading ? 'Testing Service...' : 'Test Service API'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Paper sx={{ p: 2, mt: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {directApiResponse && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%', maxHeight: '400px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Direct API Response:</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {Array.isArray(directApiResponse) ? 'Array' : typeof directApiResponse}
                {typeof directApiResponse === 'object' && !Array.isArray(directApiResponse) &&
                  `, Has 'value' property: ${directApiResponse.value ? 'Yes' : 'No'}`}
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(directApiResponse, null, 2)}
              </pre>
            </Paper>
          </Grid>
        )}

        {serviceApiResponse && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%', maxHeight: '400px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Service API Response:</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {Array.isArray(serviceApiResponse) ? 'Array' : typeof serviceApiResponse}
                {Array.isArray(serviceApiResponse) && `, Length: ${serviceApiResponse.length}`}
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(serviceApiResponse, null, 2)}
              </pre>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TestApiButton;
