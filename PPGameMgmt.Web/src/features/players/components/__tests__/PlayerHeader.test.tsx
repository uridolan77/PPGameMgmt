import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerHeader } from '../PlayerHeader';
import { createMockPlayer } from '../../utils/testUtils';

// Mock necessary hooks
jest.mock('../../hooks', () => ({
  usePlayerActions: () => ({
    goToPlayerDetail: jest.fn(),
    goToPlayerEdit: jest.fn(),
    goToPlayersList: jest.fn(),
    isDeleting: false
  })
}));

describe('PlayerHeader', () => {
  const mockPlayer = createMockPlayer();
  const mockDeleteFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders player information correctly', () => {
    render(<PlayerHeader player={mockPlayer} onDeletePlayer={mockDeleteFn} />);
    
    // Check username and email are displayed
    expect(screen.getByText(mockPlayer.username)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.email)).toBeInTheDocument();
    
    // Check badges
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText(`Level ${mockPlayer.playerLevel}`)).toBeInTheDocument();
    expect(screen.getByText(mockPlayer.segment as string)).toBeInTheDocument();
  });

  test('renders inactive status correctly', () => {
    const inactivePlayer = { ...mockPlayer, isActive: false };
    render(<PlayerHeader player={inactivePlayer} onDeletePlayer={mockDeleteFn} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('calls onDeletePlayer when delete button is clicked', () => {
    render(<PlayerHeader player={mockPlayer} onDeletePlayer={mockDeleteFn} />);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(mockDeleteFn).toHaveBeenCalledTimes(1);
  });

  test('shows avatar with correct initial', () => {
    render(<PlayerHeader player={mockPlayer} onDeletePlayer={mockDeleteFn} />);
    
    // Get the first letter of the username as uppercase
    const initial = mockPlayer.username.charAt(0).toUpperCase();
    expect(screen.getByText(initial)).toBeInTheDocument();
  });
});