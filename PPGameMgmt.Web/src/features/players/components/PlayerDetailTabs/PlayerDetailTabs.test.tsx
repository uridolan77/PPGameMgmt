import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerDetailTabs } from './PlayerDetailTabs';
import { createMockPlayer } from '../../utils/testUtils';
import { PlayerTabType } from '../../types';

// Mock the tab components
jest.mock('../PlayerOverviewTab', () => ({
  PlayerOverviewTab: () => <div data-testid="overview-tab">Overview Tab</div>
}));

jest.mock('../PlayerGamesTab', () => ({
  PlayerGamesTab: () => <div data-testid="games-tab">Games Tab</div>
}));

jest.mock('../PlayerBonusesTab', () => ({
  PlayerBonusesTab: () => <div data-testid="bonuses-tab">Bonuses Tab</div>
}));

jest.mock('../PlayerFeaturesTab', () => ({
  PlayerFeaturesTab: () => <div data-testid="features-tab">Features Tab</div>
}));

// Mock the ApiErrorDisplay component
jest.mock('../../../../shared/components', () => ({
  ApiErrorDisplay: ({ error, context, onRetry }: any) => (
    <div data-testid={`error-${context}`}>
      Error: {error.message}
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}));

describe('PlayerDetailTabs', () => {
  const mockPlayer = createMockPlayer();
  const mockTabChange = jest.fn();
  const mockRefetchSessions = jest.fn();
  const mockRefetchFeatures = jest.fn();
  const mockRefetchBonuses = jest.fn();

  const defaultProps = {
    player: mockPlayer,
    activeTab: 'overview' as PlayerTabType,
    onTabChange: mockTabChange,
    gameSessions: [],
    features: [],
    bonusClaims: [],
    sessionsLoading: false,
    featuresLoading: false,
    bonusesLoading: false,
    sessionsError: null,
    featuresError: null,
    bonusesError: null,
    refetchSessions: mockRefetchSessions,
    refetchFeatures: mockRefetchFeatures,
    refetchBonuses: mockRefetchBonuses
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the active tab correctly', () => {
    render(<PlayerDetailTabs {...defaultProps} />);
    
    expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('games-tab')).not.toBeInTheDocument();
  });

  test('changes tab when a tab trigger is clicked', () => {
    render(<PlayerDetailTabs {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Game History'));
    expect(mockTabChange).toHaveBeenCalledWith('games');
  });

  test('displays error message when there is an error', () => {
    const propsWithError = {
      ...defaultProps,
      activeTab: 'games' as PlayerTabType,
      sessionsError: new Error('Failed to load game sessions')
    };
    
    render(<PlayerDetailTabs {...propsWithError} />);
    
    expect(screen.getByTestId('error-game sessions')).toBeInTheDocument();
    expect(screen.getByText('Error: Failed to load game sessions')).toBeInTheDocument();
  });

  test('calls refetch function when retry button is clicked', () => {
    const propsWithError = {
      ...defaultProps,
      activeTab: 'features' as PlayerTabType,
      featuresError: new Error('Failed to load features')
    };
    
    render(<PlayerDetailTabs {...propsWithError} />);
    
    fireEvent.click(screen.getByText('Retry'));
    expect(mockRefetchFeatures).toHaveBeenCalledTimes(1);
  });

  test('renders different tabs based on activeTab prop', () => {
    const { rerender } = render(<PlayerDetailTabs {...defaultProps} />);
    
    // Check overview tab
    expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    
    // Change to games tab
    rerender(<PlayerDetailTabs {...defaultProps} activeTab="games" />);
    expect(screen.getByTestId('games-tab')).toBeInTheDocument();
    
    // Change to bonuses tab
    rerender(<PlayerDetailTabs {...defaultProps} activeTab="bonuses" />);
    expect(screen.getByTestId('bonuses-tab')).toBeInTheDocument();
    
    // Change to features tab
    rerender(<PlayerDetailTabs {...defaultProps} activeTab="features" />);
    expect(screen.getByTestId('features-tab')).toBeInTheDocument();
  });
});
