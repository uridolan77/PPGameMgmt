import { create } from 'zustand';

// UI state store to manage UI-specific state like sidebar state, selected tabs, filters, etc.
const useUiStore = create((set) => ({
  // Sidebar and navigation state
  isSidebarOpen: true,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // Active tab indexes for various components
  activeTabIndexes: {},
  setActiveTabIndex: (componentId, index) => set((state) => ({
    activeTabIndexes: {
      ...state.activeTabIndexes,
      [componentId]: index
    }
  })),
  
  // Filter settings for various list views
  filters: {
    games: {
      type: '',
      category: '',
      searchTerm: ''
    },
    players: {
      segment: '',
      searchTerm: ''
    },
    bonuses: {
      type: '',
      segment: '',
      gameId: '',
      searchTerm: ''
    }
  },
  
  // Update a specific filter
  setFilter: (view, filterName, value) => set((state) => ({
    filters: {
      ...state.filters,
      [view]: {
        ...state.filters[view],
        [filterName]: value
      }
    }
  })),
  
  // Update multiple filters at once
  setFilters: (view, filterValues) => set((state) => ({
    filters: {
      ...state.filters,
      [view]: {
        ...state.filters[view],
        ...filterValues
      }
    }
  })),
  
  // Reset filters for a specific view
  resetFilters: (view) => set((state) => {
    const defaultFilters = {
      games: { type: '', category: '', searchTerm: '' },
      players: { segment: '', searchTerm: '' },
      bonuses: { type: '', segment: '', gameId: '', searchTerm: '' }
    };
    
    return {
      filters: {
        ...state.filters,
        [view]: defaultFilters[view]
      }
    };
  }),
  
  // Theme and appearance preferences
  theme: 'light',
  setTheme: (theme) => {
    localStorage.setItem('preferred-theme', theme);
    set({ theme });
  },
  
  // Handle alerts and notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));

export default useUiStore;