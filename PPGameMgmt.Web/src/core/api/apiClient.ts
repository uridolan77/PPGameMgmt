import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { logger } from '../logger';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.authToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        // Log request (debug only)
        if (import.meta.env.DEV) {
          logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response (debug only)
        if (import.meta.env.DEV) {
          logger.debug(`API Response: ${response.status} ${response.config.url}`, {
            data: response.data,
          });
        }
        
        return response;
      },
      async (error: AxiosError) => {
        // Log error
        logger.error('API Error:', error);
        
        // Check if custom error message exists in response
        const customErrorMessage = 
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message: string }).message
            : undefined;
        
        // Enhance error with custom message
        const enhancedError = new Error(
          customErrorMessage || error.message || 'An unknown error occurred'
        ) as Error & { status?: number; data?: any };
        
        // Add status code and data
        if (error.response) {
          enhancedError.status = error.response.status;
          enhancedError.data = error.response.data;
        }
        
        return Promise.reject(enhancedError);
      }
    );
  }

  // Set auth token for authenticated requests
  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();