import { ApiError, ApiResponse, RequestConfig } from './types';

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  
  constructor(config: { baseUrl: string }) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }
  
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }
  
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const { method, url, data, params, headers = {} } = config;
      
      const fullUrl = new URL(url, this.baseUrl);
      
      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            fullUrl.searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(fullUrl.toString(), {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
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
      
      // Parse response data
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        // Handle other content types as needed
        responseData = await response.text() as unknown as T;
      }
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error.message || 'Network Error',
        0
      );
    }
  }
  
  // Convenience methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.request<T>({ method: 'GET', url, params });
    return response.data;
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.request<T>({ method: 'POST', url, data });
    return response.data;
  }
  
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.request<T>({ method: 'PUT', url, data });
    return response.data;
  }
  
  async delete<T>(url: string): Promise<T> {
    const response = await this.request<T>({ method: 'DELETE', url });
    return response.data;
  }
}