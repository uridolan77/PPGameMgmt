import { StateCreator } from 'zustand';
import { PreferencesState, TablePreference, UIPreference, NotificationPreference } from './types';
import { RootState } from '../../types';

export const createPreferencesSlice: StateCreator<
  RootState,
  [],
  [],
  { preferences: PreferencesState }
> = (set) => ({
  preferences: {
    // Dashboard preferences
    dashboardLayout: 'default',
    dashboardWidgets: [
      'playerStats',
      'gameStats',
      'bonusStats', 
      'topGames',
      'recentActivity'
    ],
    
    // Table view preferences
    tablePreferences: {
      games: { pageSize: 10, visibleColumns: ['name', 'type', 'category', 'provider'] },
      players: { pageSize: 10, visibleColumns: ['username', 'email', 'segment', 'lastLogin'] },
      bonuses: { pageSize: 10, visibleColumns: ['name', 'type', 'value', 'startDate', 'endDate'] }
    },
    
    // UI preferences
    uiPreferences: {
      density: 'standard',
      animationsEnabled: true,
      dateFormat: 'MM/dd/yyyy',
      timeFormat: 'h:mm a'
    },
    
    // Notification preferences
    notificationPreferences: {
      enabled: true,
      sound: true,
      desktop: false,
      email: false
    },
    
    // Actions
    setDashboardLayout: (layout) => set((state) => ({
      preferences: {
        ...state.preferences,
        dashboardLayout: layout
      }
    })),
    
    setDashboardWidgets: (widgets) => set((state) => ({
      preferences: {
        ...state.preferences,
        dashboardWidgets: widgets
      }
    })),
    
    setTablePreference: (table, preference) => set((state) => ({
      preferences: {
        ...state.preferences,
        tablePreferences: {
          ...state.preferences.tablePreferences,
          [table]: {
            ...state.preferences.tablePreferences[table],
            ...preference
          }
        }
      }
    })),
    
    setUIPreference: (preference) => set((state) => ({
      preferences: {
        ...state.preferences,
        uiPreferences: {
          ...state.preferences.uiPreferences,
          ...preference
        }
      }
    })),
    
    setNotificationPreference: (preference) => set((state) => ({
      preferences: {
        ...state.preferences,
        notificationPreferences: {
          ...state.preferences.notificationPreferences,
          ...preference
        }
      }
    }))
  }
});

export * from './types';