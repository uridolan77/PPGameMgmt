import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'outline' | 'ghost';
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className = '',
  size = 'default',
  variant = 'outline',
  disabled = false,
}) => {
  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    // Always include first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);
    
    // Add dots if there's a gap after page 1
    if (leftSibling > 2) {
      pageNumbers.push('...');
    }
    
    // Add pages in the middle
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add dots if there's a gap before the last page
    if (rightSibling < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always include last page if it's different from the first
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <nav className={cn('flex items-center justify-center space-x-1', className)}>
      {/* First Page Button */}
      {showFirstLast && (
        <Button
          variant={variant}
          size={size}
          className="hidden sm:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || disabled}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}
      
      {/* Previous Page Button */}
      <Button
        variant={variant}
        size={size}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex items-center justify-center px-3"
            >
              &#8230;
            </div>
          );
        }
        
        const pageNum = page as number;
        const isActive = currentPage === pageNum;
        
        return (
          <Button
            key={pageNum}
            variant={isActive ? 'default' : variant}
            size={size}
            onClick={() => onPageChange(pageNum)}
            disabled={disabled}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Page ${pageNum}`}
            className={cn(
              isActive && 'pointer-events-none',
              size === 'sm' ? 'h-8 w-8' : 'h-10 w-10', 
              'justify-center'
            )}
          >
            {pageNum}
          </Button>
        );
      })}
      
      {/* Next Page Button */}
      <Button
        variant={variant}
        size={size}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Last Page Button */}
      {showFirstLast && (
        <Button
          variant={variant}
          size={size}
          className="hidden sm:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || disabled}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
};

// Simple pagination with just prev/next
export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
  showPageIndicator?: boolean;
  variant?: 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  prevLabel,
  nextLabel,
  className = '',
  showPageIndicator = true,
  variant = 'outline',
  size = 'default',
  disabled = false,
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Button
        variant={variant}
        size={size}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {prevLabel || 'Previous'}
      </Button>
      
      {showPageIndicator && (
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      )}
      
      <Button
        variant={variant}
        size={size}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className="flex items-center"
      >
        {nextLabel || 'Next'}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};