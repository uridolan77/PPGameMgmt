import { ApiError } from './types';

// Configuration interface for the API client
export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retryConfig?: RetryConfig;
  cacheConfig?: CacheConfig; // New cache configuration
}

// Configuration for retry logic
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // Base delay in milliseconds
  retryStatusCodes: number[]; // HTTP status codes that should trigger a retry
}

// New cache configuration interface
export interface CacheConfig {
  enabled: boolean;
  maxAge: number; // Cache TTL in milliseconds
  excludePaths?: RegExp[]; // Paths that should not be cached
}

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retryConfig: RetryConfig;
  private cacheConfig: CacheConfig;
  private cacheStore: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders || {
      'Content-Type': 'application/json',
    };
    this.timeout = config.timeout || 30000; // Default 30s timeout

    // Default retry configuration
    this.retryConfig = config.retryConfig || {
      maxRetries: 2,
      retryDelay: 300,
      retryStatusCodes: [408, 429, 500, 502, 503, 504]
    };

    // Default cache configuration
    this.cacheConfig = config.cacheConfig || {
      enabled: false,
      maxAge: 5 * 60 * 1000, // 5 minutes
      excludePaths: [/\/auth\//] // Don't cache auth endpoints
    };
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

  // Clear cache entries
  clearCache(pattern?: RegExp): void {
    if (!pattern) {
      this.cacheStore.clear();
      return;
    }

    // Clear specific cache entries
    for (const key of this.cacheStore.keys()) {
      if (pattern.test(key)) {
        this.cacheStore.delete(key);
      }
    }
  }

  // Check if a URL should be cached
  private shouldCache(url: string, method: string): boolean {
    if (!this.cacheConfig.enabled) return false;
    if (method !== 'GET') return false;

    // Check for excluded paths
    if (this.cacheConfig.excludePaths) {
      for (const pattern of this.cacheConfig.excludePaths) {
        if (pattern.test(url)) return false;
      }
    }

    return true;
  }

  // Get cache key
  private getCacheKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}|${paramString}`;
  }

  // Check cache for a request
  private getCachedResponse<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.getCacheKey(url, params);
    const cached = this.cacheStore.get(key);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheConfig.maxAge) {
      this.cacheStore.delete(key);
      return null;
    }

    return cached.data as T;
  }

  // Store response in cache
  private setCachedResponse<T>(url: string, params: Record<string, any> | undefined, data: T): void {
    const key = this.getCacheKey(url, params);
    this.cacheStore.set(key, {
      data,
      timestamp: Date.now()
    });
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
    signal?: AbortSignal; // Support for abort signals
    skipRetry?: boolean; // Option to skip retry logic
    skipCache?: boolean; // Option to skip cache
  }): Promise<T> {
    const { method, url, data, params, headers = {}, signal, skipRetry = false, skipCache = false } = config;

    // Check cache for GET requests
    if (!skipCache && method === 'GET' && this.shouldCache(url, method)) {
      const cachedResponse = this.getCachedResponse<T>(url, params);
      if (cachedResponse) {
        return Promise.resolve(cachedResponse);
      }
    }

    // Number of retries performed
    let retries = 0;

    // Exponential backoff with jitter for retry delays
    const getRetryDelay = () => {
      const baseDelay = this.retryConfig.retryDelay;
      const exponentialDelay = baseDelay * Math.pow(2, retries);
      // Add jitter (±20%)
      const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
      return Math.min(exponentialDelay + jitter, 10000); // Cap at 10s
    };

    // Retry logic wrapper
    const executeWithRetry = async (): Promise<T> => {
      try {
        // Construct the full URL with parameters
        const fullUrl = new URL(url.startsWith('/') ? url.slice(1) : url, this.baseUrl);

        // Log the request URL for debugging
        console.log(`API Request: ${method} ${fullUrl.toString()}`);

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
          credentials: 'include', // Include credentials (cookies) in cross-origin requests
        };

        // Use provided signal or create one for timeout
        let timeoutId: number | undefined;
        let controller: AbortController | undefined;

        if (signal) {
          // Use the provided signal directly
          requestConfig.signal = signal;
        } else {
          // Set up timeout with AbortController
          controller = new AbortController();
          timeoutId = window.setTimeout(() => controller.abort(), this.timeout);
          requestConfig.signal = controller.signal;
        }

        // Make the request
        const response = await fetch(fullUrl.toString(), requestConfig);

        // Clean up timeout if we created one
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Handle error responses
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = null;
          }

          // Check if we should retry based on status code
          if (
            !skipRetry &&
            retries < this.retryConfig.maxRetries &&
            this.retryConfig.retryStatusCodes.includes(response.status)
          ) {
            retries++;
            const delay = getRetryDelay();

            console.info(`Request to ${url} failed with status ${response.status}. Retrying (${retries}/${this.retryConfig.maxRetries}) after ${delay}ms`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            return executeWithRetry();
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

        // Store in cache if applicable
        if (!skipCache && method === 'GET' && this.shouldCache(url, method)) {
          this.setCachedResponse(url, params, responseData);
        }

        return responseData;

      } catch (error) {
        // Check for abort/timeout
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout or aborted', 408);
        }

        // Check if we should retry network errors
        if (
          !skipRetry &&
          retries < this.retryConfig.maxRetries &&
          !(error instanceof ApiError) // Only retry non-API errors (network issues)
        ) {
          retries++;
          const delay = getRetryDelay();

          console.info(`Request to ${url} failed with error: ${error.message}. Retrying (${retries}/${this.retryConfig.maxRetries}) after ${delay}ms`);

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry();
        }

        // Re-throw API errors
        if (error instanceof ApiError) {
          throw error;
        }

        // Handle other errors
        throw new ApiError(
          error.message || 'Network Error',
          0,
          { originalError: error }
        );
      }
    };

    // Start the request process with retry support
    return executeWithRetry();
  }

  // HTTP methods with proper typing and AbortSignal support
  async get<T>(url: string, params?: Record<string, any>, options?: { signal?: AbortSignal; skipRetry?: boolean; skipCache?: boolean }): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      signal: options?.signal,
      skipRetry: options?.skipRetry,
      skipCache: options?.skipCache
    });
  }

  async post<T>(url: string, data?: any, options?: { signal?: AbortSignal; skipRetry?: boolean }): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      signal: options?.signal,
      skipRetry: options?.skipRetry
    });
  }

  async put<T>(url: string, data?: any, options?: { signal?: AbortSignal; skipRetry?: boolean }): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      signal: options?.signal,
      skipRetry: options?.skipRetry
    });
  }

  async delete<T>(url: string, options?: { signal?: AbortSignal; skipRetry?: boolean }): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      signal: options?.signal,
      skipRetry: options?.skipRetry
    });
  }

  async patch<T>(url: string, data?: any, options?: { signal?: AbortSignal; skipRetry?: boolean }): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      signal: options?.signal,
      skipRetry: options?.skipRetry
    });
  }
}

// Create and export a default instance with environment variables
export const apiClient = new ApiClient({
  baseUrl: 'https://localhost:7210', // Use HTTPS and the base URL without the /api suffix
  cacheConfig: {
    enabled: true,
    maxAge: 2 * 60 * 1000, // 2 minutes
    excludePaths: [/\/auth\//]
  }
});