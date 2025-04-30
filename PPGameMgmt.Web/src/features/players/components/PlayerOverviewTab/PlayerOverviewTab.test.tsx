import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayerOverviewTab } from './PlayerOverviewTab';
import { createMockPlayer } from '../../utils/testUtils';
import { PlayerFeature, GameSession, BonusClaim } from '../../types';

// Mock the formatDate function
jest.mock('../../utils', () => ({
  formatDate: (date: string) => date ? 'Formatted Date' : 'Never',
}));

describe('PlayerOverviewTab', () => {
  const mockPlayer = createMockPlayer({
    username: 'testuser',
    email: 'test@example.com',
    playerLevel: 3,
    segment: 'VIP',
    isActive: true,
    lastLogin: '2023-01-01T12:00:00Z',
  });

  const mockGameSessions: GameSession[] = [
    {
      id: 1,
      gameId: 101,
      gameName: 'Test Game 1',
      gameProvider: 'Test Provider',
      startTime: '2023-01-01T10:00:00Z',
      endTime: '2023-01-01T11:00:00Z',
      duration: 3600,
      betAmount: 100,
      winAmount: 150,
      rounds: 20,
    },
    {
      id: 2,
      gameId: 102,
      gameName: 'Test Game 2',
      gameProvider: 'Test Provider',
      startTime: '2023-01-02T10:00:00Z',
      endTime: '2023-01-02T11:00:00Z',
      duration: 3600,
      betAmount: 200,
      winAmount: 150,
      rounds: 30,
    },
  ];

  const mockFeatures: PlayerFeature[] = [
    { id: 1, name: 'VIP Access', isEnabled: true },
    { id: 2, name: 'Bonus Multiplier', isEnabled: true },
    { id: 3, name: 'Early Access', isEnabled: false },
  ];

  const mockBonusClaims: BonusClaim[] = [
    {
      id: 1,
      bonusId: 101,
      bonusName: 'Welcome Bonus',
      bonusValue: '100%',
      claimDate: '2023-01-01T12:00:00Z',
      expiryDate: '2023-02-01T12:00:00Z',
      status: 'Active',
      wageringProgress: 50,
    },
    {
      id: 2,
      bonusId: 102,
      bonusName: 'Reload Bonus',
      bonusValue: '$50',
      claimDate: '2023-01-15T12:00:00Z',
      expiryDate: '2023-02-15T12:00:00Z',
      status: 'Expired',
      wageringProgress: 100,
    },
  ];

  test('renders account information correctly', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        sessionsLoading={false}
        featuresLoading={false}
        bonusesLoading={false}
      />
    );

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('renders activity summary correctly when data is loaded', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        gameSessions={mockGameSessions}
        features={mockFeatures}
        bonusClaims={mockBonusClaims}
        sessionsLoading={false}
        featuresLoading={false}
        bonusesLoading={false}
      />
    );

    expect(screen.getByText('Activity Summary')).toBeInTheDocument();
    expect(screen.getByText('Formatted Date')).toBeInTheDocument();
    expect(screen.getByText('2 sessions')).toBeInTheDocument();
    expect(screen.getByText('1 active out of 2 total')).toBeInTheDocument();
    expect(screen.getByText('2 of 3 features enabled')).toBeInTheDocument();
  });

  test('renders loading state correctly', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        sessionsLoading={true}
        featuresLoading={true}
        bonusesLoading={true}
      />
    );

    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts).toHaveLength(3);
  });

  test('renders financial summary when game sessions are available', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        gameSessions={mockGameSessions}
        sessionsLoading={false}
        featuresLoading={false}
        bonusesLoading={false}
      />
    );

    expect(screen.getByText('Financial Summary')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument(); // Total bets
    expect(screen.getByText('$300.00')).toBeInTheDocument(); // Total wins
    expect(screen.getByText('0.00')).toBeInTheDocument(); // Net profit
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // Return %
  });

  test('renders feature highlights when features are available', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        features={mockFeatures}
        sessionsLoading={false}
        featuresLoading={false}
        bonusesLoading={false}
      />
    );

    expect(screen.getByText('Feature Highlights')).toBeInTheDocument();
    expect(screen.getByText('VIP Access')).toBeInTheDocument();
    expect(screen.getByText('Bonus Multiplier')).toBeInTheDocument();
  });

  test('does not render financial summary when no game sessions', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        gameSessions={[]}
        sessionsLoading={false}
        featuresLoading={false}
        bonusesLoading={false}
      />
    );

    expect(screen.queryByText('Financial Summary')).not.toBeInTheDocument();
  });

  test('does not render feature highlights when no features', () => {
    render(
      <PlayerOverviewTab
        player={mockPlayer}
        features={[]}
        sessionsLoading={false}
        featuresLoading={false}
        bonusesLoading={false}
      />
    );

    expect(screen.queryByText('Feature Highlights')).not.toBeInTheDocument();
  });
});
