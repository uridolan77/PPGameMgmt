export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'statistic' | 'list' | 'activity';
  size: 'small' | 'medium' | 'large' | 'full';
  position: number;
  dataSource: string;
}

export interface WidgetSettings {
  visible: boolean;
  refreshInterval?: number;
  customTitle?: string;
}

export type WidgetId = 'playerStats' | 'gameStats' | 'topGames' | 'recentActivity';

export interface DashboardState {
  widgets: Record<WidgetId, WidgetSettings>;
  isCustomizing: boolean;
  lastRefreshed: Date | null;
}