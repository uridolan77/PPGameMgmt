/**
 * Standardized component prop types and interfaces
 * These types provide consistency across similar components
 */

import React from 'react';

/**
 * Base props for all data display components
 */
export interface DataDisplayProps<T> {
  /**
   * The data to display
   */
  data: T[];
  
  /**
   * Whether the data is loading
   */
  isLoading?: boolean;
  
  /**
   * Error that occurred during data fetching
   */
  error?: Error | unknown;
  
  /**
   * Function to render each item in the data array
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /**
   * Component to display when data is empty
   */
  emptyState?: React.ReactNode;
  
  /**
   * Component to display when data is loading
   */
  loadingState?: React.ReactNode;
  
  /**
   * Component to display when an error occurs
   */
  errorState?: React.ReactNode;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for table components
 */
export interface TableProps<T> extends DataDisplayProps<T> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[];
  
  /**
   * Table caption
   */
  caption?: string;
  
  /**
   * Whether the table has striped rows
   */
  striped?: boolean;
  
  /**
   * Whether the table has hoverable rows
   */
  hoverable?: boolean;
  
  /**
   * Whether the table has a border
   */
  bordered?: boolean;
  
  /**
   * Whether the table is compact
   */
  compact?: boolean;
  
  /**
   * Function to handle row click
   */
  onRowClick?: (item: T, index: number) => void;
  
  /**
   * Function to handle row selection
   */
  onSelect?: (items: T[]) => void;
  
  /**
   * Whether the table has selectable rows
   */
  selectable?: boolean;
  
  /**
   * Currently selected items
   */
  selectedItems?: T[];
  
  /**
   * Function to identify unique items (used for selection)
   */
  getItemId?: (item: T) => string | number;
}

/**
 * Table column configuration
 */
export interface TableColumn<T> {
  /**
   * Unique identifier for the column
   */
  id: string;
  
  /**
   * Column header text
   */
  header: React.ReactNode;
  
  /**
   * Function to get the cell value
   */
  accessor: (item: T) => React.ReactNode;
  
  /**
   * CSS class name for the column
   */
  className?: string;
  
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  
  /**
   * Whether the column is filterable
   */
  filterable?: boolean;
  
  /**
   * Column width (CSS value)
   */
  width?: string;
  
  /**
   * Whether the column is visible
   */
  visible?: boolean;
}

/**
 * Props for list components
 */
export interface ListProps<T> extends DataDisplayProps<T> {
  /**
   * List layout (horizontal or vertical)
   */
  layout?: 'horizontal' | 'vertical';
  
  /**
   * Whether the list is divided (has separators)
   */
  divided?: boolean;
  
  /**
   * Function to handle item click
   */
  onItemClick?: (item: T, index: number) => void;
}

/**
 * Props for grid components
 */
export interface GridProps<T> extends DataDisplayProps<T> {
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Gap between grid items (CSS value)
   */
  gap?: string;
  
  /**
   * Function to handle item click
   */
  onItemClick?: (item: T, index: number) => void;
}

/**
 * Props for card components
 */
export interface CardProps {
  /**
   * Card title
   */
  title?: React.ReactNode;
  
  /**
   * Card subtitle
   */
  subtitle?: React.ReactNode;
  
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Card footer
   */
  footer?: React.ReactNode;
  
  /**
   * Card image
   */
  image?: {
    src: string;
    alt?: string;
    position?: 'top' | 'bottom';
  };
  
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  
  /**
   * Function to handle card click
   */
  onClick?: () => void;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for form components
 */
export interface FormProps<T> {
  /**
   * Initial form values
   */
  initialValues: T;
  
  /**
   * Function to handle form submission
   */
  onSubmit: (values: T) => void | Promise<void>;
  
  /**
   * Function to handle form cancellation
   */
  onCancel?: () => void;
  
  /**
   * Whether the form is submitting
   */
  isSubmitting?: boolean;
  
  /**
   * Whether the form is in edit mode
   */
  isEditing?: boolean;
  
  /**
   * Form validation schema
   */
  validationSchema?: any;
  
  /**
   * Form children
   */
  children: React.ReactNode | ((formProps: any) => React.ReactNode);
  
  /**
   * Submit button text
   */
  submitText?: string;
  
  /**
   * Cancel button text
   */
  cancelText?: string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for modal components
 */
export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Function to handle modal close
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title?: React.ReactNode;
  
  /**
   * Modal content
   */
  children: React.ReactNode;
  
  /**
   * Modal footer
   */
  footer?: React.ReactNode;
  
  /**
   * Whether the modal has a close button
   */
  hasCloseButton?: boolean;
  
  /**
   * Whether the modal closes when clicking outside
   */
  closeOnClickOutside?: boolean;
  
  /**
   * Whether the modal closes when pressing escape
   */
  closeOnEscape?: boolean;
  
  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for tab components
 */
export interface TabsProps {
  /**
   * Tab items
   */
  tabs: TabItem[];
  
  /**
   * Active tab ID
   */
  activeTab?: string;
  
  /**
   * Function to handle tab change
   */
  onTabChange?: (tabId: string) => void;
  
  /**
   * Tab orientation
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Tab item configuration
 */
export interface TabItem {
  /**
   * Tab ID
   */
  id: string;
  
  /**
   * Tab label
   */
  label: React.ReactNode;
  
  /**
   * Tab content
   */
  content: React.ReactNode;
  
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
  
  /**
   * Tab icon
   */
  icon?: React.ReactNode;
}

/**
 * Props for pagination components
 */
export interface PaginationProps {
  /**
   * Current page
   */
  currentPage: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Function to handle page change
   */
  onPageChange: (page: number) => void;
  
  /**
   * Number of pages to show before and after the current page
   */
  siblingCount?: number;
  
  /**
   * Whether to show the first and last page buttons
   */
  showFirstLast?: boolean;
  
  /**
   * Whether to show the previous and next page buttons
   */
  showPrevNext?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for loading indicator components
 */
export interface LoadingIndicatorProps {
  /**
   * Loading indicator size
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Loading indicator color
   */
  color?: string;
  
  /**
   * Loading indicator label
   */
  label?: string;
  
  /**
   * Whether the loading indicator is centered
   */
  centered?: boolean;
  
  /**
   * Whether the loading indicator is full page
   */
  fullPage?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for error display components
 */
export interface ErrorDisplayProps {
  /**
   * Error object
   */
  error: Error | unknown;
  
  /**
   * Error context
   */
  context?: string;
  
  /**
   * Function to handle retry
   */
  onRetry?: () => void;
  
  /**
   * Whether to show error details
   */
  showDetails?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for empty state components
 */
export interface EmptyStateProps {
  /**
   * Empty state title
   */
  title: string;
  
  /**
   * Empty state description
   */
  description?: string;
  
  /**
   * Empty state icon
   */
  icon?: React.ReactNode;
  
  /**
   * Empty state action
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for virtualized list components
 */
export interface VirtualizedListProps<T> extends Omit<DataDisplayProps<T>, 'renderItem'> {
  /**
   * Function to render each item in the virtualized list
   */
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  
  /**
   * Item height (in pixels)
   */
  itemHeight: number;
  
  /**
   * List height (in pixels)
   */
  height: number;
  
  /**
   * List width (in pixels or percentage)
   */
  width?: string | number;
  
  /**
   * Number of items to render outside the visible area
   */
  overscanCount?: number;
}

/**
 * Props for search components
 */
export interface SearchProps {
  /**
   * Search value
   */
  value: string;
  
  /**
   * Function to handle search change
   */
  onChange: (value: string) => void;
  
  /**
   * Function to handle search submit
   */
  onSubmit?: (value: string) => void;
  
  /**
   * Search placeholder
   */
  placeholder?: string;
  
  /**
   * Whether the search is loading
   */
  isLoading?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for filter components
 */
export interface FilterProps<T> {
  /**
   * Filter values
   */
  filters: T;
  
  /**
   * Function to handle filter change
   */
  onFilterChange: (filters: T) => void;
  
  /**
   * Function to handle filter reset
   */
  onReset?: () => void;
  
  /**
   * Function to handle filter apply
   */
  onApply?: (filters: T) => void;
  
  /**
   * Whether the filter is loading
   */
  isLoading?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Props for sort components
 */
export interface SortProps<T> {
  /**
   * Sort options
   */
  options: SortOption<T>[];
  
  /**
   * Current sort option
   */
  currentSort?: SortOption<T>;
  
  /**
   * Function to handle sort change
   */
  onSortChange: (option: SortOption<T>) => void;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Sort option configuration
 */
export interface SortOption<T> {
  /**
   * Sort option ID
   */
  id: string;
  
  /**
   * Sort option label
   */
  label: string;
  
  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
  
  /**
   * Sort field
   */
  field: keyof T;
}

export default {
  DataDisplayProps,
  TableProps,
  TableColumn,
  ListProps,
  GridProps,
  CardProps,
  FormProps,
  ModalProps,
  TabsProps,
  TabItem,
  PaginationProps,
  LoadingIndicatorProps,
  ErrorDisplayProps,
  EmptyStateProps,
  VirtualizedListProps,
  SearchProps,
  FilterProps,
  SortProps,
  SortOption,
};
