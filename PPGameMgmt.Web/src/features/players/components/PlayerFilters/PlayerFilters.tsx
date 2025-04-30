import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, FilterIcon, DownloadIcon, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface PlayerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
}

export const PlayerFilters: React.FC<PlayerFiltersProps> = ({
  searchQuery,
  onSearchChange,
  onFilter,
  onExport
}) => {
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      onExport(format);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pb-4 fade-in gap-3">
      <div className="relative w-full max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search players by name, email or segment..."
          className="mui-style-input pl-9 w-full transition-all border border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-primary h-9 text-sm rounded-md"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="mui-style-button transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 h-9 rounded-md text-sm font-medium"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span>Filter</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mui-style-button transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 h-9 rounded-md text-sm font-medium"
            >
              <DownloadIcon className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mui-style-dropdown shadow-lg rounded-md border border-slate-200 dark:border-slate-700 p-0 min-w-[180px] overflow-hidden">
            <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="mr-2">📄</span> Export as CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="mr-2">📊</span> Export as Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="mr-2">📑</span> Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PlayerFilters;
