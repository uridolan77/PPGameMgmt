import { apiClient } from './client';

/**
 * Test API service to verify API connection
 */
export const testApi = {
  /**
   * Test GET request to the Players endpoint
   */
  testGetPlayers: async () => {
    try {
      // Try different URL formats to see which one works
      console.log('Testing API connection...');
      
      // Test 1: Direct URL without /api prefix
      try {
        console.log('Test 1: Direct URL without /api prefix');
        const response1 = await fetch('http://localhost:7210/Players');
        console.log('Test 1 response status:', response1.status);
        if (response1.ok) {
          const data1 = await response1.json();
          console.log('Test 1 data:', data1);
        }
      } catch (error) {
        console.error('Test 1 error:', error);
      }
      
      // Test 2: Direct URL with /api prefix
      try {
        console.log('Test 2: Direct URL with /api prefix');
        const response2 = await fetch('http://localhost:7210/api/Players');
        console.log('Test 2 response status:', response2.status);
        if (response2.ok) {
          const data2 = await response2.json();
          console.log('Test 2 data:', data2);
        }
      } catch (error) {
        console.error('Test 2 error:', error);
      }
      
      // Test 3: Using apiClient with /Players
      try {
        console.log('Test 3: Using apiClient with /Players');
        const response3 = await apiClient.get('/Players', {});
        console.log('Test 3 data:', response3);
        return response3;
      } catch (error) {
        console.error('Test 3 error:', error);
      }
      
      // Test 4: Using apiClient with /api/Players
      try {
        console.log('Test 4: Using apiClient with /api/Players');
        const response4 = await apiClient.get('/api/Players', {});
        console.log('Test 4 data:', response4);
        return response4;
      } catch (error) {
        console.error('Test 4 error:', error);
      }
      
      return null;
    } catch (error) {
      console.error('Test API error:', error);
      throw error;
    }
  }
};
