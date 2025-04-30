import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameDetailView } from './GameDetailView';
import { Game } from '../../types';

// Mock the OptimizedImage component
jest.mock('../../../../shared/components', () => ({
  OptimizedImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="optimized-image" />
  ),
}));

// Mock the formatDate function
jest.mock('../../../../shared/utils/formatting', () => ({
  formatDate: (date: string) => 'Formatted Date',
}));

describe('GameDetailView', () => {
  const mockGame: Game = {
    id: 1,
    title: 'Test Game',
    description: 'This is a test game description',
    thumbnailUrl: 'https://example.com/test.jpg',
    provider: 'Test Provider',
    category: 'Slots',
    releaseDate: '2023-01-01',
    isActive: true,
    popularity: 4,
    features: ['Feature 1', 'Feature 2'],
  };

  const mockOnEdit = jest.fn();

  test('renders loading state correctly', () => {
    render(<GameDetailView game={null} isLoading={true} onEdit={mockOnEdit} />);
    
    expect(screen.getAllByRole('tablist')).toHaveLength(1);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    
    // Check for skeletons
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('renders not found state correctly', () => {
    render(<GameDetailView game={null} isLoading={false} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Game not found')).toBeInTheDocument();
    expect(screen.getByText('The game you are looking for does not exist or has been removed.')).toBeInTheDocument();
  });

  test('renders game details correctly', () => {
    render(<GameDetailView game={mockGame} isLoading={false} onEdit={mockOnEdit} />);
    
    // Check for game title
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    
    // Check for game details
    expect(screen.getByText('Test Provider')).toBeInTheDocument();
    expect(screen.getByText('Slots')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Formatted Date')).toBeInTheDocument();
    expect(screen.getByText('This is a test game description')).toBeInTheDocument();
    
    // Check for features
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    
    // Check for image
    expect(screen.getByTestId('optimized-image')).toHaveAttribute('src', 'https://example.com/test.jpg');
  });

  test('renders inactive game correctly', () => {
    const inactiveGame = { ...mockGame, isActive: false };
    render(<GameDetailView game={inactiveGame} isLoading={false} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('renders game without thumbnail correctly', () => {
    const gameWithoutThumbnail = { ...mockGame, thumbnailUrl: '' };
    render(<GameDetailView game={gameWithoutThumbnail} isLoading={false} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<GameDetailView game={mockGame} isLoading={false} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit Game'));
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  test('changes tab when a tab is clicked', () => {
    render(<GameDetailView game={mockGame} isLoading={false} onEdit={mockOnEdit} />);
    
    // Initially the details tab should be active
    expect(screen.getByText('Game Information')).toBeInTheDocument();
    
    // Click on the stats tab
    fireEvent.click(screen.getByRole('tab', { name: 'Statistics' }));
    expect(screen.getByText('Game Statistics')).toBeInTheDocument();
    
    // Click on the history tab
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));
    expect(screen.getByText('Game History')).toBeInTheDocument();
  });
});
