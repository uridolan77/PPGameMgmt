import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RootState } from './types';
import { createPreferencesSlice } from './slices/preferences';
import { createUISlice } from './slices/ui';
import { createAuthSlice } from '../../features/auth/store';

// Create the unified store with all slices
export const useStore = create<RootState>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args),
        ...createUISlice(...args),
        ...createPreferencesSlice(...args),
      }),
      {
        name: 'ppgames-store',
        // Only persist specified parts of the state
        partialize: (state) => ({
          auth: {
            accessToken: state.auth.accessToken,
            refreshToken: state.auth.refreshToken,
            user: state.auth.user,
          },
          preferences: state.preferences,
          ui: {
            darkMode: state.ui.darkMode,
            currentTheme: state.ui.currentTheme
          }
        }),
      }
    )
  )
);

// Export types
export * from './types';
export * from './slices/ui/types';
export * from './slices/preferences/types';