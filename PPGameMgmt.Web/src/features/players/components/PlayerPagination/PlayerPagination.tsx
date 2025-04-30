import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row items-center justify-between py-3 fade-in border-t border-slate-200 dark:border-slate-700 mt-4">
      <div className="flex-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-0">
        <span className="font-medium">{totalItems}</span> {totalItems === 1 ? 'player' : 'players'} found
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden md:inline-block">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            onClick={handlePrevious}
            className="mui-style-button h-8 text-xs rounded-l-md rounded-r-none border border-slate-300 dark:border-slate-600"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={handleNext}
            className="mui-style-button h-8 text-xs rounded-l-none rounded-r-md border border-slate-300 dark:border-slate-600"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerPagination;
