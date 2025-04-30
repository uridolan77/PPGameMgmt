import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from './GameCard';
import { Game } from '../../types';

// Mock the OptimizedImage component
jest.mock('../../../../shared/components/OptimizedImage', () => ({
  OptimizedImage: ({ src, alt, className, children }: any) => (
    <img src={src} alt={alt} className={className} data-testid="optimized-image">
      {children}
    </img>
  ),
}));

// Sample game data for testing
const mockGame: Game = {
  id: 1,
  title: 'Test Game',
  description: 'This is a test game description',
  thumbnailUrl: 'https://example.com/test.jpg',
  provider: 'Test Provider',
  category: 'Slots',
  releaseDate: '2023-01-01',
  isActive: true,
  popularity: 5,
  features: ['feature1', 'feature2'],
};

describe('GameCard', () => {
  it('renders game information correctly', () => {
    render(<GameCard game={mockGame} />);
    
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('Test Provider')).toBeInTheDocument();
    expect(screen.getByText('This is a test game description')).toBeInTheDocument();
    expect(screen.getByText('Slots')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTestId('optimized-image')).toHaveAttribute('src', 'https://example.com/test.jpg');
  });
  
  it('renders compact variant correctly', () => {
    render(<GameCard game={mockGame} variant="compact" />);
    
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('Test Provider')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    // These elements should not be in the compact variant
    expect(screen.queryByText('This is a test game description')).not.toBeInTheDocument();
    expect(screen.queryByText('Released:')).not.toBeInTheDocument();
  });
  
  it('shows correct status for inactive game', () => {
    const inactiveGame = { ...mockGame, isActive: false };
    render(<GameCard game={inactiveGame} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<GameCard game={mockGame} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Game'));
    expect(handleClick).toHaveBeenCalledWith(mockGame);
  });
  
  it('passes priority prop to OptimizedImage', () => {
    render(<GameCard game={mockGame} priority={true} />);
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
  });
});
