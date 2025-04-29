export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Notification[];
  currentTheme: string;
  
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: string) => void;
}