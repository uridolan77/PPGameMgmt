import React, { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';

const FetchTest: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('FetchTest: Fetching data...');
      
      // Use the browser's fetch API directly
      const response = await fetch('https://localhost:7210/api/Players?api-version=1.0', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('FetchTest: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('FetchTest: Data received:', result);
      setData(result);
    } catch (err) {
      console.error('FetchTest: Error fetching data:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Simple Fetch Test</Typography>
      
      <Button 
        variant="contained" 
        color="warning" 
        onClick={fetchData}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Loading...' : 'Fetch with Browser API'}
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
              : typeof data === 'object' && data.value 
                ? `Found ${Array.isArray(data.value) ? data.value.length : 0} players in value property` 
                : 'Data is not an array or object with value property'}
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default FetchTest;
