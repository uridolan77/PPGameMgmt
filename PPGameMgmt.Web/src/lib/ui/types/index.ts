/**
 * Shared UI component types
 * 
 * This module exports type definitions and interfaces used across
 * the UI component library.
 */

// Base component props with common properties
export interface BaseProps {
  className?: string;
  id?: string;
  testId?: string;
}

// Common variants that can be applied to multiple components
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

// Common sizes that can be applied to multiple components
export type Size = 'sm' | 'md' | 'lg' | 'xl';