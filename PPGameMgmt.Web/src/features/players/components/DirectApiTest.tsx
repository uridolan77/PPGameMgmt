import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { playerApi } from '../services';

const DirectApiTest: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('DirectApiTest: Fetching data...');
      
      const result = await playerApi.getAll();
      console.log('DirectApiTest: Data received:', result);
      setData(result);
    } catch (err) {
      console.error('DirectApiTest: Error fetching data:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('DirectApiTest: Component mounted');
    fetchData();
    return () => {
      console.log('DirectApiTest: Component unmounted');
    };
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Direct API Test</Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={fetchData}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Loading...' : 'Fetch Players Directly'}
      </Button>
      
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Loading data...</Typography>
        </Box>
      )}
      
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}
      
      {data && (
        <Paper sx={{ p: 2, mb: 2, maxHeight: '300px', overflow: 'auto' }}>
          <Typography variant="subtitle1" gutterBottom>
            {Array.isArray(data) 
              ? `Found ${data.length} players` 
              : 'Data is not an array'}
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default DirectApiTest;
