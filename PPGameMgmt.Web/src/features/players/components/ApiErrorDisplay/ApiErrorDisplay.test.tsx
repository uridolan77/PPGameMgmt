import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiErrorDisplay } from './ApiErrorDisplay';

// Mock the getUserFriendlyErrorMessage function
jest.mock('../../utils', () => ({
  getUserFriendlyErrorMessage: (error: unknown, context?: string) => {
    if (context) {
      return `Error in ${context}: ${error}`;
    }
    return `Error: ${error}`;
  },
}));

describe('ApiErrorDisplay', () => {
  test('renders error message correctly', () => {
    render(<ApiErrorDisplay error="Test error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  test('renders error message with context correctly', () => {
    render(<ApiErrorDisplay error="Test error" context="Player API" />);
    
    expect(screen.getByText('Error in Player API: Test error')).toBeInTheDocument();
  });

  test('does not render retry button when onRetry is not provided', () => {
    render(<ApiErrorDisplay error="Test error" />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  test('renders retry button when onRetry is provided', () => {
    render(<ApiErrorDisplay error="Test error" onRetry={() => {}} />);
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    const handleRetry = jest.fn();
    render(<ApiErrorDisplay error="Test error" onRetry={handleRetry} />);
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
