import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from './LoadingIndicator';

describe('LoadingIndicator', () => {
  test('renders with default message', () => {
    render(<LoadingIndicator />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<LoadingIndicator message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  test('applies size classes correctly', () => {
    const { container, rerender } = render(<LoadingIndicator size="small" />);
    
    // Check for small size class
    expect(container.querySelector('.h-4.w-4')).toBeInTheDocument();
    
    // Rerender with medium size
    rerender(<LoadingIndicator size="medium" />);
    expect(container.querySelector('.h-6.w-6')).toBeInTheDocument();
    
    // Rerender with large size
    rerender(<LoadingIndicator size="large" />);
    expect(container.querySelector('.h-8.w-8')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<LoadingIndicator className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
