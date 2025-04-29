// Utility to help with HTTPS certificate issues in development
import config from '../config';

/**
 * This function helps check if the API is available and handle SSL certificate issues
 * by making a test request to the API. In many development environments,
 * self-signed certificates can cause issues with API calls.
 */
export const validateApiConnection = async () => {
  try {
    const apiUrl = config.apiUrl;
    console.log(`Testing API connection to ${apiUrl}...`);

    // Make a simple request to test the connection
    // The fetch options { mode: 'no-cors' } are only for the initial test
    // to bypass potential SSL certificate issues
    // Using /recommendations/test which is a known endpoint that exists
    await fetch(`${apiUrl}/recommendations/test`, {
      method: 'GET',
      mode: 'no-cors'
    });

    console.log('API connection successful');
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);

    // If we're in development, show helpful instructions for certificate issues
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'If you are seeing certificate errors, you may need to:\n' +
        '1. Accept the self-signed certificate by opening the API URL directly in browser\n' +
        `2. Navigate to ${config.apiUrl} and proceed despite the warning\n` +
        '3. Return to this application and refresh'
      );
    }
    return false;
  }
};

export default {
  validateApiConnection
};