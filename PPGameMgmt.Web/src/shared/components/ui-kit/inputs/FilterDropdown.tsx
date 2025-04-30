import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption<T = string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface FilterGroupProps<T = string> {
  label: string;
  options: FilterOption<T>[];
  type?: 'single' | 'multiple';
}

export interface FilterDropdownProps<T = string> {
  groups: FilterGroupProps<T>[];
  selectedValues?: Record<string, T | T[]>;
  onFilterChange: (groupLabel: string, value: T | T[]) => void;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  align?: 'start' | 'center' | 'end';
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
}

export function FilterDropdown<T = string>({
  groups,
  selectedValues = {},
  onFilterChange,
  triggerLabel = 'Filter',
  triggerIcon = <Filter className="h-4 w-4 mr-2" />,
  variant = 'outline',
  size = 'default',
  align = 'end',
  className = '',
  dropdownClassName = '',
  disabled = false,
}: FilterDropdownProps<T>) {
  // Count active filters
  const activeFiltersCount = Object.values(selectedValues).reduce((count, value) => {
    if (Array.isArray(value)) {
      count += value.length;
    } else if (value !== undefined) {
      count += 1;
    }
    return count;
  }, 0);

  // Handle item selection
  const handleItemSelect = <V extends T>(group: FilterGroupProps<T>, option: FilterOption<V>) => {
    const currentValue = selectedValues[group.label];
    
    if (group.type === 'multiple') {
      const currentValues = (currentValue as V[]) || [];
      const isSelected = currentValues.some((val) => val === option.value);
      
      let newValues: V[];
      
      if (isSelected) {
        newValues = currentValues.filter((val) => val !== option.value);
      } else {
        newValues = [...currentValues, option.value];
      }
      
      onFilterChange(group.label, newValues as T[]);
    } else {
      // Single select - toggle selection
      const newValue = currentValue === option.value ? undefined : option.value;
      onFilterChange(group.label, newValue as T);
    }
  };

  // Check if an option is selected
  const isOptionSelected = <V extends T>(group: FilterGroupProps<T>, option: FilterOption<V>): boolean => {
    const currentValue = selectedValues[group.label];
    
    if (group.type === 'multiple') {
      const currentValues = (currentValue as V[]) || [];
      return currentValues.some((val) => val === option.value);
    } else {
      return currentValue === option.value;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button 
          variant={variant} 
          size={size}
          className={cn('flex items-center gap-1', className)}
          disabled={disabled}
        >
          {triggerIcon}
          {triggerLabel}
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align={align} className={cn('w-56', dropdownClassName)}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            
            {group.options.map((option, optionIndex) => {
              const isSelected = isOptionSelected(group, option);
              
              return (
                <DropdownMenuItem
                  key={optionIndex}
                  disabled={option.disabled}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleItemSelect(group, option)}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              );
            })}
            
            {groupIndex < groups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}