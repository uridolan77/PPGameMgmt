import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiErrorDisplay } from './ApiErrorDisplay';

// Mock the getErrorMessage function
jest.mock('../../../core/error', () => ({
  getErrorMessage: (error: unknown) => {
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  },
}));

describe('ApiErrorDisplay', () => {
  test('renders error message correctly', () => {
    render(<ApiErrorDisplay error="Test error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  test('renders error message with context correctly', () => {
    render(<ApiErrorDisplay error="Test error" context="Player API" />);
    
    expect(screen.getByText('Player API: Test error')).toBeInTheDocument();
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

  test('applies custom className', () => {
    const { container } = render(<ApiErrorDisplay error="Test error" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('border-destructive');
  });
});
