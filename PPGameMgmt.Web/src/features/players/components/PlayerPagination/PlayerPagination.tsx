import React from 'react';
import { Button } from '@/components/ui/button';

interface PlayerPaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const PlayerPagination: React.FC<PlayerPaginationProps> = ({
  totalItems,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (hasPrevious && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {totalItems} {totalItems === 1 ? 'player' : 'players'} found
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={handlePrevious}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PlayerPagination;
