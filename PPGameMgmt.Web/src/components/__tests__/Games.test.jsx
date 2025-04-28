import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Games from '../Games';
import { gameService } from '../../services';

// Mock the gameService
vi.mock('../../services', () => ({
  gameService: {
    getAllGames: vi.fn(),
    searchGames: vi.fn()
  }
}));

describe('Games Component', () => {
  // Sample game data for testing
  const mockGames = [
    { 
      id: '1', 
      name: 'Test Slot Game', 
      type: 'Slot', 
      category: 'Featured',
      provider: 'Test Provider' 
    },
    { 
      id: '2', 
      name: 'Poker Night', 
      type: 'Poker', 
      category: 'Popular',
      provider: 'Another Provider' 
    }
  ];

  // Helper function to render the component with Router
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Games />
      </BrowserRouter>
    );
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    gameService.getAllGames.mockResolvedValue(mockGames);
    gameService.searchGames.mockResolvedValue(mockGames);
  });

  it('renders the component with loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Loading games...')).toBeInTheDocument();
  });

  it('loads and displays games after API call', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(gameService.getAllGames).toHaveBeenCalledTimes(1);
    });
    
    // Check if games are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Slot Game')).toBeInTheDocument();
      expect(screen.getByText('Poker Night')).toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    // Mock API failure
    gameService.getAllGames.mockRejectedValue(new Error('API error'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error loading games: API error')).toBeInTheDocument();
    });
  });

  it('filters games by type', async () => {
    const filteredGames = [mockGames[0]]; // Only the Slot game
    gameService.getAllGames.mockResolvedValueOnce(mockGames)
                          .mockResolvedValueOnce(filteredGames);
    
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Slot Game')).toBeInTheDocument();
    });
    
    // Change the type filter
    const typeFilter = screen.getByLabelText('Game Type:');
    await user.selectOptions(typeFilter, 'Slot');
    
    // The component should call gameService.getAllGames with the filter
    await waitFor(() => {
      expect(gameService.getAllGames).toHaveBeenCalledWith('Slot', null);
    });
  });

  it('searches for games', async () => {
    const searchResults = [mockGames[0]];
    gameService.searchGames.mockResolvedValue(searchResults);
    
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading games...')).not.toBeInTheDocument();
    });
    
    // Type into search field
    const searchInput = screen.getByPlaceholderText('Search games...');
    await user.type(searchInput, 'Slot');
    
    // Click search button
    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);
    
    // Verify search was called
    await waitFor(() => {
      expect(gameService.searchGames).toHaveBeenCalledWith('Slot');
    });
  });

  it('displays "No games found" when API returns empty array', async () => {
    // Mock empty game list
    gameService.getAllGames.mockResolvedValue([]);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No games found')).toBeInTheDocument();
    });
  });

  it('contains a link to add new game', async () => {
    renderComponent();
    
    await waitFor(() => {
      const addLink = screen.getByText('Add New Game');
      expect(addLink).toBeInTheDocument();
      expect(addLink.tagName).toBe('A');
      expect(addLink).toHaveAttribute('href', '/games/new');
    });
  });
});