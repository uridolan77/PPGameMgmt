import { create } from 'zustand';
import { DashboardState, WidgetId, WidgetSettings } from '../types';

const DEFAULT_WIDGETS: Record<WidgetId, WidgetSettings> = {
  playerStats: { visible: true, refreshInterval: 300000 },
  gameStats: { visible: true, refreshInterval: 300000 },
  topGames: { visible: true, refreshInterval: 600000 },
  recentActivity: { visible: true, refreshInterval: 60000 }
};

export const useDashboardStore = create<DashboardState & {
  toggleWidget: (widgetId: WidgetId) => void;
  updateWidgetSettings: (widgetId: WidgetId, settings: Partial<WidgetSettings>) => void;
  setCustomizing: (isCustomizing: boolean) => void;
  refreshDashboard: () => void;
  resetToDefaults: () => void;
}>((set) => ({
  widgets: DEFAULT_WIDGETS,
  isCustomizing: false,
  lastRefreshed: null,

  toggleWidget: (widgetId) => set((state) => ({
    widgets: {
      ...state.widgets,
      [widgetId]: {
        ...state.widgets[widgetId],
        visible: !state.widgets[widgetId].visible
      }
    }
  })),

  updateWidgetSettings: (widgetId, settings) => set((state) => ({
    widgets: {
      ...state.widgets,
      [widgetId]: {
        ...state.widgets[widgetId],
        ...settings
      }
    }
  })),

  setCustomizing: (isCustomizing) => set({ isCustomizing }),

  refreshDashboard: () => set({ lastRefreshed: new Date() }),

  resetToDefaults: () => set({ widgets: DEFAULT_WIDGETS })
}));