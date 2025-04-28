// API Service for handling requests to the backend
import config from '../config';

// Default request options with credentials included for authentication
const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to handle API responses consistently
const handleResponse = async (response) => {
  if (!response.ok) {
    // Get error details from the response if available
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `API Error: ${response.statusText}`;
    } catch (e) {
      errorMessage = `API Error: ${response.status} ${response.statusText}`;
    }

    console.error(`API request failed: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  try {
    // Only try to parse as JSON if there's content
    if (response.status !== 204) { // 204 No Content
      return await response.json();
    }
    return null;
  } catch (e) {
    console.warn('Response could not be parsed as JSON', e);
    return null;
  }
};

// Generic function to make API calls
const apiCall = async (endpoint, method = 'GET', body = null, customOptions = {}) => {
  try {
    const url = `${config.apiUrl}/${endpoint}`;
    console.log(`Making ${method} request to: ${url}`);
    
    const options = {
      ...defaultOptions,
      ...customOptions,
      method,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error('API call failed:', error);
    // Re-throw the error so it can be handled by the component
    throw error;
  }
};

// Export specific methods for different HTTP verbs
export const apiService = {
  get: (endpoint, customOptions = {}) => 
    apiCall(endpoint, 'GET', null, customOptions),
  
  post: (endpoint, body, customOptions = {}) => 
    apiCall(endpoint, 'POST', body, customOptions),
  
  put: (endpoint, body, customOptions = {}) => 
    apiCall(endpoint, 'PUT', body, customOptions),
  
  patch: (endpoint, body, customOptions = {}) => 
    apiCall(endpoint, 'PATCH', body, customOptions),
  
  delete: (endpoint, customOptions = {}) => 
    apiCall(endpoint, 'DELETE', null, customOptions),
};

export default apiService;