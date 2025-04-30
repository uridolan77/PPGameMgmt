import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';
import { Player } from '../../types';

// Mock the formatDate function
jest.mock('../../../../shared/utils/formatting', () => ({
  formatDate: (date: string) => date,
}));

// Sample player data for testing
const mockPlayer: Player = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  playerLevel: 5,
  registrationDate: '2023-01-01',
  lastLoginDate: '2023-05-15',
  segment: 'Regular',
  country: 'US',
  avatarUrl: null,
};

describe('PlayerCard', () => {
  it('renders player information correctly', () => {
    render(<PlayerCard player={mockPlayer} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Player Level')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Joined')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('Last Login')).toBeInTheDocument();
    expect(screen.getByText('2023-05-15')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
  });
  
  it('renders compact variant correctly', () => {
    render(<PlayerCard player={mockPlayer} variant="compact" />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    
    // These elements should not be in the compact variant
    expect(screen.queryByText('Player Level')).not.toBeInTheDocument();
    expect(screen.queryByText('Joined')).not.toBeInTheDocument();
  });
  
  it('shows correct badge for inactive player', () => {
    const inactivePlayer = { ...mockPlayer, isActive: false };
    render(<PlayerCard player={inactivePlayer} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
  
  it('shows correct badge for VIP player', () => {
    const vipPlayer = { ...mockPlayer, segment: 'VIP' };
    render(<PlayerCard player={vipPlayer} />);
    
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<PlayerCard player={mockPlayer} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('testuser'));
    expect(handleClick).toHaveBeenCalledWith(mockPlayer);
  });
  
  it('displays correct initials in avatar fallback', () => {
    render(<PlayerCard player={mockPlayer} />);
    
    expect(screen.getByText('TU')).toBeInTheDocument();
  });
});
