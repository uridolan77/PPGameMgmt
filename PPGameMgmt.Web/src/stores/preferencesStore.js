import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Preferences store to manage user settings and preferences that should persist across sessions
const usePreferencesStore = create(
  persist(
    (set) => ({
      // Dashboard preferences
      dashboardLayout: 'default',
      dashboardWidgets: [
        'playerStats',
        'gameStats',
        'bonusStats',
        'topGames',
        'recentActivity'
      ],
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setDashboardWidgets: (widgets) => set({ dashboardWidgets: widgets }),
      
      // Table view preferences (items per page, visible columns, etc.)
      tablePreferences: {
        games: { pageSize: 10, visibleColumns: ['name', 'type', 'category', 'provider'] },
        players: { pageSize: 10, visibleColumns: ['username', 'email', 'segment', 'lastLogin'] },
        bonuses: { pageSize: 10, visibleColumns: ['name', 'type', 'value', 'startDate', 'endDate'] }
      },
      
      setTablePreference: (table, preference, value) => set((state) => ({
        tablePreferences: {
          ...state.tablePreferences,
          [table]: {
            ...state.tablePreferences[table],
            [preference]: value
          }
        }
      })),
      
      // User interface preferences
      uiPreferences: {
        theme: 'light', // light, dark, system
        density: 'comfortable', // comfortable, compact, spacious
        animations: true,
        colorScheme: 'blue'
      },
      
      setUiPreference: (preference, value) => set((state) => ({
        uiPreferences: {
          ...state.uiPreferences,
          [preference]: value
        }
      })),
      
      // Notification preferences
      notificationPreferences: {
        newPlayer: true,
        newBonus: true,
        bonusClaimed: true,
        systemAlerts: true,
        emailNotifications: false
      },
      
      setNotificationPreference: (preference, value) => set((state) => ({
        notificationPreferences: {
          ...state.notificationPreferences,
          [preference]: value
        }
      })),
      
      // Reset preferences to defaults
      resetPreferences: () => set({
        dashboardLayout: 'default',
        dashboardWidgets: [
          'playerStats',
          'gameStats',
          'bonusStats',
          'topGames',
          'recentActivity'
        ],
        tablePreferences: {
          games: { pageSize: 10, visibleColumns: ['name', 'type', 'category', 'provider'] },
          players: { pageSize: 10, visibleColumns: ['username', 'email', 'segment', 'lastLogin'] },
          bonuses: { pageSize: 10, visibleColumns: ['name', 'type', 'value', 'startDate', 'endDate'] }
        },
        uiPreferences: {
          theme: 'light',
          density: 'comfortable',
          animations: true,
          colorScheme: 'blue'
        },
        notificationPreferences: {
          newPlayer: true,
          newBonus: true,
          bonusClaimed: true,
          systemAlerts: true,
          emailNotifications: false
        }
      })
    }),
    {
      name: 'user-preferences', // name of the item in localStorage
      version: 1, // a version number for future migrations
      
      // Optional merge function for handling store updates
      merge: (persistedState, currentState) => {
        // Deep merge persisted state with current state
        return {
          ...currentState,
          ...persistedState,
          // Handle nested objects explicitly
          tablePreferences: {
            ...currentState.tablePreferences,
            ...persistedState.tablePreferences
          },
          uiPreferences: {
            ...currentState.uiPreferences,
            ...persistedState.uiPreferences
          },
          notificationPreferences: {
            ...currentState.notificationPreferences,
            ...persistedState.notificationPreferences
          }
        };
      }
    }
  )
);

export default usePreferencesStore;