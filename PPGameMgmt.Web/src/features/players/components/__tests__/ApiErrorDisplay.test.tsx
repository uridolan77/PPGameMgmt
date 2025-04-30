import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiErrorDisplay } from '../ApiErrorDisplay';
import { ApiError } from '../../utils/errorUtils';

describe('ApiErrorDisplay', () => {
  test('renders error message correctly', () => {
    const error = new Error('Test error message');
    
    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
  
  test('renders user-friendly message for API errors', () => {
    const error = new ApiError('Not found', 404);
    
    render(<ApiErrorDisplay error={error} context="player" />);
    
    expect(screen.getByText('The requested player could not be found.')).toBeInTheDocument();
  });
  
  test('calls onRetry when retry button is clicked', () => {
    const mockRetry = jest.fn();
    const error = new Error('Test error');
    
    render(<ApiErrorDisplay error={error} onRetry={mockRetry} />);
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
  
  test('does not render retry button when no onRetry prop is provided', () => {
    const error = new Error('Test error');
    
    render(<ApiErrorDisplay error={error} />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});