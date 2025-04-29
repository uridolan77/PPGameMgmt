import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { UIState, Notification } from './types';
import { RootState } from '../../types';

export const createUISlice: StateCreator<
  RootState,
  [],
  [],
  { ui: UIState }
> = (set) => ({
  ui: {
    sidebarOpen: true,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    notifications: [],
    currentTheme: 'default',
    
    toggleSidebar: () => set((state) => ({
      ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
    })),
    
    toggleDarkMode: () => set((state) => ({
      ui: { ...state.ui, darkMode: !state.ui.darkMode }
    })),
    
    addNotification: (notification) => set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: uuidv4()
      };
      
      return {
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, newNotification]
        }
      };
    }),
    
    removeNotification: (id) => set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter(n => n.id !== id)
      }
    })),
    
    setTheme: (theme) => set((state) => ({
      ui: { ...state.ui, currentTheme: theme }
    }))
  }
});

export * from './types';