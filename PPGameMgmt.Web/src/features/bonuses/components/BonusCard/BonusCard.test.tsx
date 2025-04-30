import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BonusCard } from './BonusCard';
import { Bonus } from '../../types';

// Mock the formatDate function
jest.mock('../../../../shared/utils/formatting', () => ({
  formatDate: (date: string) => date,
}));

// Mock the formatBonusValue function
jest.mock('../../utils/bonusUtils', () => ({
  formatBonusValue: (bonus: Bonus) => `${bonus.bonusType}: ${bonus.value}${bonus.valueType === 'PERCENTAGE' ? '%' : ''}`,
}));

// Sample bonus data for testing
const mockBonus: Bonus = {
  id: 1,
  name: 'Welcome Bonus',
  description: 'Bonus for new players',
  bonusType: 'DEPOSIT',
  value: 100,
  valueType: 'FIXED',
  isActive: true,
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  currentClaims: 50,
  maxClaims: 100,
  targetSegment: 'New Players',
};

describe('BonusCard', () => {
  it('renders bonus information correctly', () => {
    render(<BonusCard bonus={mockBonus} />);
    
    expect(screen.getByText('Welcome Bonus')).toBeInTheDocument();
    expect(screen.getByText('Bonus for new players')).toBeInTheDocument();
    expect(screen.getByText('DEPOSIT: 100')).toBeInTheDocument();
    expect(screen.getByText('New Players')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 - 2023-12-31')).toBeInTheDocument();
    expect(screen.getByText('Claims')).toBeInTheDocument();
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  
  it('renders compact variant correctly', () => {
    render(<BonusCard bonus={mockBonus} variant="compact" />);
    
    expect(screen.getByText('Welcome Bonus')).toBeInTheDocument();
    expect(screen.getByText('DEPOSIT: 100')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    // These elements should not be in the compact variant
    expect(screen.queryByText('Bonus for new players')).not.toBeInTheDocument();
    expect(screen.queryByText('Claims')).not.toBeInTheDocument();
  });
  
  it('shows correct badge for inactive bonus', () => {
    const inactiveBonus = { ...mockBonus, isActive: false };
    render(<BonusCard bonus={inactiveBonus} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
  
  it('shows correct badge for expired bonus', () => {
    const expiredBonus = { ...mockBonus, endDate: '2022-01-01' };
    render(<BonusCard bonus={expiredBonus} />);
    
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<BonusCard bonus={mockBonus} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Welcome Bonus'));
    expect(handleClick).toHaveBeenCalledWith(mockBonus);
  });
  
  it('displays unlimited claims correctly', () => {
    const unlimitedBonus = { ...mockBonus, maxClaims: null };
    render(<BonusCard bonus={unlimitedBonus} />);
    
    expect(screen.getByText('50 (unlimited)')).toBeInTheDocument();
  });
});
