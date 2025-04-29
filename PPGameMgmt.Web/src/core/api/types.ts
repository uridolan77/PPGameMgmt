export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// Custom error type for API-related errors
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data || null;
    
    // Ensure instanceof works properly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  
  // Helper to check if it's a server error
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
  
  // Helper to check if it's a client error
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
  
  // Helper to check if it's an authentication error
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

// Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}