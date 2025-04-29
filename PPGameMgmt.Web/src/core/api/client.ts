import { ApiError } from './types';

// Configuration interface for the API client
export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  
  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders || {
      'Content-Type': 'application/json',
    };
    this.timeout = config.timeout || 30000; // Default 30s timeout
  }
  
  // Authentication methods
  setAuthToken(token: string | null): void {
    this.authToken = token;
    
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await this.post<{ token: string }>('/auth/refresh');
      const newToken = response.token;
      this.setAuthToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }
  
  // Private request method
  private async request<T>(config: {
    method: string;
    url: string;
    data?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
  }): Promise<T> {
    try {
      const { method, url, data, params, headers = {} } = config;
      
      // Construct the full URL with parameters
      const fullUrl = new URL(url.startsWith('/') ? url.slice(1) : url, this.baseUrl);
      
      // Add query parameters if they exist
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            fullUrl.searchParams.append(key, String(value));
          }
        });
      }
      
      // Prepare headers with auth token if available
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };
      
      // Request configuration
      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      requestConfig.signal = controller.signal;
      
      // Make the request
      const response = await fetch(fullUrl.toString(), requestConfig);
      clearTimeout(timeoutId);
      
      // Handle error responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }
        
        throw new ApiError(
          errorData?.message || response.statusText,
          response.status,
          errorData
        );
      }
      
      // Parse successful response
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as unknown as T;
      }
      
      return responseData;
    } catch (error) {
      // Handle aborted requests
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle other errors
      throw new ApiError(
        error.message || 'Network Error',
        0
      );
    }
  }
  
  // HTTP methods with proper typing
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }
  
  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }
  
  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }
  
  async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data });
  }
}

// Create and export a default instance with environment variables
export const apiClient = new ApiClient({ 
  baseUrl: import.meta.env.VITE_API_URL || '/api'
});