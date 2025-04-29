export interface TablePreference {
  pageSize: number;
  visibleColumns: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UIPreference {
  density: 'compact' | 'standard' | 'comfortable';
  animationsEnabled: boolean;
  dateFormat: string;
  timeFormat: string;
}

export interface NotificationPreference {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
}

export interface PreferencesState {
  // Dashboard preferences
  dashboardLayout: string;
  dashboardWidgets: string[];
  
  // Table view preferences
  tablePreferences: Record<string, TablePreference>;
  
  // UI preferences
  uiPreferences: UIPreference;
  
  // Notification preferences
  notificationPreferences: NotificationPreference;
  
  // Actions
  setDashboardLayout: (layout: string) => void;
  setDashboardWidgets: (widgets: string[]) => void;
  setTablePreference: (table: string, preference: Partial<TablePreference>) => void;
  setUIPreference: (preference: Partial<UIPreference>) => void;
  setNotificationPreference: (preference: Partial<NotificationPreference>) => void;
}