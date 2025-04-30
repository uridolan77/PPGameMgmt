import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Input } from '../..'; // Import from centralized UI library
import { Button } from '../..'; // Import from centralized UI library
import { BaseProps } from '../types';

export interface SearchInputProps extends BaseProps {
  /**
   * Callback function triggered when the search term changes
   */
  onSearch: (term: string) => void;
  
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  
  /**
   * Initial search term value
   */
  initialValue?: string;
  
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
  
  /**
   * Whether to show the clear button
   */
  showClearButton?: boolean;
}

/**
 * SearchInput component for searching content
 * 
 * @example
 * ```tsx
 * <SearchInput 
 *   onSearch={handleSearch} 
 *   placeholder="Search players..."
 *   initialValue="John"
 * />
 * ```
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search...',
  initialValue = '',
  debounceMs = 300,
  className = '',
  showClearButton = true,
  testId,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`} data-testid={testId}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        className="pl-10 pr-10"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        data-testid={testId ? `${testId}-input` : undefined}
      />
      {showClearButton && searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
          onClick={handleClear}
          data-testid={testId ? `${testId}-clear` : undefined}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
};