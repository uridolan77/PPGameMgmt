import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PlayerHeader } from './PlayerHeader';
import { createMockPlayer } from '../utils/testUtils';

const meta: Meta<typeof PlayerHeader> = {
  title: 'Features/Players/PlayerHeader',
  component: PlayerHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PlayerHeader>;

// Mock the usePlayerActions hook for Storybook
jest.mock('../hooks', () => ({
  usePlayerActions: () => ({
    goToPlayerDetail: () => console.log('Navigate to player detail'),
    goToPlayerEdit: () => console.log('Navigate to player edit'),
    goToPlayersList: () => console.log('Navigate to players list'),
    isDeleting: false,
  }),
}));

// Create mock player data
const activePlayer = createMockPlayer({
  username: 'johndoe',
  email: 'john.doe@example.com',
  playerLevel: 4,
  segment: 'vip',
});

const inactivePlayer = createMockPlayer({
  username: 'janedoe',
  email: 'jane.doe@example.com',
  playerLevel: 2,
  segment: 'standard',
  isActive: false,
});

const newPlayer = createMockPlayer({
  username: 'newplayer',
  email: 'new.player@example.com',
  playerLevel: 1,
  segment: 'new',
  lastLogin: null,
});

// Example Stories
export const ActivePlayer: Story = {
  args: {
    player: activePlayer,
    onDeletePlayer: () => console.log('Delete player clicked'),
  },
};

export const InactivePlayer: Story = {
  args: {
    player: inactivePlayer,
    onDeletePlayer: () => console.log('Delete player clicked'),
  },
};

export const NewPlayer: Story = {
  args: {
    player: newPlayer,
    onDeletePlayer: () => console.log('Delete player clicked'),
  },
};

export const DeletingPlayer: Story = {
  args: {
    player: activePlayer,
    onDeletePlayer: () => console.log('Delete player clicked'),
  },
  parameters: {
    hooks: {
      usePlayerActions: () => ({
        goToPlayerDetail: () => console.log('Navigate to player detail'),
        goToPlayerEdit: () => console.log('Navigate to player edit'),
        goToPlayersList: () => console.log('Navigate to players list'),
        isDeleting: true,
      }),
    },
  },
};