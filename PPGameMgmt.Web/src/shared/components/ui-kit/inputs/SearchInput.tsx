import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';

// Import the new component
import { SearchInput as NewSearchInput } from '@/lib/ui/inputs';

export interface SearchInputProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
}

/**
 * @deprecated Use SearchInput from @/lib/ui/inputs instead
 */
export const SearchInput: React.FC<SearchInputProps> = (props) => {
  // Log deprecation warning in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'The SearchInput component from @/shared/components/ui-kit is deprecated. ' +
      'Please use SearchInput from @/lib/ui/inputs instead.'
    );
  }
  
  // Pass through to new component
  return <NewSearchInput {...props} />;
};