import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerFeaturesTab } from './PlayerFeaturesTab';
import { PlayerFeature } from '../../types';

// Mock the LoadingIndicator component
jest.mock('../../../../shared/components/LoadingIndicator', () => ({
  LoadingIndicator: ({ message }: { message: string }) => (
    <div data-testid="loading-indicator">{message}</div>
  ),
}));

// Sample features data for testing
const mockFeatures: PlayerFeature[] = [
  { id: 1, name: 'VIP Access', isEnabled: true },
  { id: 2, name: 'Bonus Multiplier', isEnabled: true },
  { id: 3, name: 'Early Access', isEnabled: false },
  { id: 4, name: 'Special Promotions', isEnabled: false },
];

describe('PlayerFeaturesTab', () => {
  test('renders loading indicator when loading', () => {
    render(<PlayerFeaturesTab loading={true} />);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Loading features...')).toBeInTheDocument();
  });

  test('renders message when no features are available', () => {
    render(<PlayerFeaturesTab features={[]} loading={false} />);

    expect(screen.getByText('No features found for this player')).toBeInTheDocument();
  });

  test('renders features correctly when provided', () => {
    render(<PlayerFeaturesTab features={mockFeatures} loading={false} />);

    // Check section headers
    expect(screen.getByText('Enabled Features')).toBeInTheDocument();
    expect(screen.getByText('Disabled Features')).toBeInTheDocument();

    // Check feature names
    expect(screen.getByText('VIP Access')).toBeInTheDocument();
    expect(screen.getByText('Bonus Multiplier')).toBeInTheDocument();
    expect(screen.getByText('Early Access')).toBeInTheDocument();
    expect(screen.getByText('Special Promotions')).toBeInTheDocument();

    // Check feature count summary
    expect(screen.getByText('2 of 4 features enabled')).toBeInTheDocument();
  });

  test('calls onToggleFeature when switch is clicked in editable mode', () => {
    const handleToggle = jest.fn();
    render(
      <PlayerFeaturesTab
        features={mockFeatures}
        loading={false}
        onToggleFeature={handleToggle}
        isReadOnly={false}
      />
    );

    // Find all switches (should be 4, one for each feature)
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(4);

    // Click the first switch
    fireEvent.click(switches[0]);
    expect(handleToggle).toHaveBeenCalledWith(mockFeatures[0]);
  });

  test('does not render switches in read-only mode', () => {
    render(
      <PlayerFeaturesTab
        features={mockFeatures}
        loading={false}
        onToggleFeature={jest.fn()}
        isReadOnly={true}
      />
    );

    // Should not find any switches
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
