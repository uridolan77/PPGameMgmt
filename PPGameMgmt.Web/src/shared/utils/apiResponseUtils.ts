/**
 * Standardized API response format
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  statusCode: number;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated API response format
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
  message?: string;
  statusCode: number;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Process a standard API response
 * @param response The raw API response
 * @returns The processed data from the API response
 * @throws Error if the response was not successful
 */
export function processApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || `API Error: ${response.statusCode}`);
  }
  
  return response.data;
}

/**
 * Process a paginated API response
 * @param response The raw paginated API response
 * @returns Object containing data array and pagination metadata
 * @throws Error if the response was not successful
 */
export function processPaginatedResponse<T>(
  response: PaginatedResponse<T>
): { data: T[]; meta: PaginationMeta } {
  if (!response.success) {
    throw new Error(response.message || `API Error: ${response.statusCode}`);
  }
  
  return {
    data: response.data,
    meta: response.meta
  };
}

/**
 * Format pagination parameters for API requests
 * @param params The pagination parameters provided by the client
 * @returns An object with standardized pagination parameter names
 */
export function formatPaginationParams(params: PaginationParams = {}): Record<string, string | number> {
  return {
    page: params.page !== undefined ? params.page : 1,
    limit: params.pageSize !== undefined ? params.pageSize : 20,
    ...(params.sortBy ? { sort: params.sortBy } : {}),
    ...(params.sortDirection ? { order: params.sortDirection } : {}),
  };
}

/**
 * Calculate pagination metadata from response headers or data
 * @param total Total number of items
 * @param currentPage Current page number
 * @param pageSize Number of items per page
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  currentPage: number,
  pageSize: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    currentPage,
    pageSize,
    totalItems: total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

/**
 * Helper function to create pagination controls
 * @param meta Pagination metadata
 * @param onPageChange Callback when page changes
 * @returns Functions and data for pagination controls
 */
export function usePagination(
  meta: PaginationMeta,
  onPageChange: (page: number) => void
) {
  const nextPage = () => {
    if (meta.hasNextPage) {
      onPageChange(meta.currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (meta.hasPrevPage) {
      onPageChange(meta.currentPage - 1);
    }
  };
  
  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, meta.totalPages));
    onPageChange(targetPage);
  };
  
  const getPageNumbers = (maxVisible: number = 5): number[] => {
    const pages: number[] = [];
    
    if (meta.totalPages <= maxVisible) {
      // If we have fewer pages than the maximum visible, show all
      for (let i = 1; i <= meta.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first and last page
      // Show current page and pages around it
      const leftOffset = Math.floor((maxVisible - 3) / 2);
      const rightOffset = Math.ceil((maxVisible - 3) / 2);
      
      let startPage = Math.max(meta.currentPage - leftOffset, 1);
      let endPage = Math.min(meta.currentPage + rightOffset, meta.totalPages);
      
      // Adjust if we're near the start or end
      if (startPage <= 3) {
        endPage = Math.min(maxVisible, meta.totalPages);
        startPage = 1;
      } else if (endPage >= meta.totalPages - 2) {
        startPage = Math.max(meta.totalPages - maxVisible + 1, 1);
        endPage = meta.totalPages;
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis indication
      if (startPage > 1) {
        pages.unshift(-1); // Use -1 to indicate ellipsis
        pages.unshift(1);  // Always show first page
      }
      
      if (endPage < meta.totalPages) {
        pages.push(-1); // Use -1 to indicate ellipsis
        pages.push(meta.totalPages); // Always show last page
      }
    }
    
    return pages;
  };
  
  return {
    nextPage,
    prevPage,
    goToPage,
    getPageNumbers,
    ...meta
  };
}