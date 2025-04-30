import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, Crown, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconColor, trend }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <TrendingUp className="h-4 w-4 mr-1" />;
    if (trend.direction === 'down') return <TrendingDown className="h-4 w-4 mr-1" />;
    return null;
  };

  return (
    <Card className="mui-style-card h-full overflow-hidden bg-white dark:bg-slate-800 border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {title}
            </CardDescription>
            <div className="mt-1 mb-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
            {subtitle && (
              <div className={`flex items-center text-xs ${trend?.direction ? trendColors[trend.direction] : ''}`}>
                {getTrendIcon()}
                <span>
                  {subtitle}
                </span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor} shadow-md`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PlayerStatsProps {
  totalPlayers?: number;
  activePlayers?: number;
  newPlayers?: number;
  vipPlayers?: number;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({
  totalPlayers = 0,
  activePlayers = 0,
  newPlayers = 0,
  vipPlayers = 0
}) => {
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate percentages and trends
  const activePercentage = totalPlayers > 0
    ? Math.round((activePlayers / totalPlayers) * 100)
    : 0;

  const vipPercentage = totalPlayers > 0
    ? Math.round((vipPlayers / totalPlayers) * 100)
    : 0;

  // Simulated trend data (in a real app, this would come from API)
  const totalPlayersTrend = { value: 12, direction: 'up' as const };
  const activePlayersTrend = { value: 8, direction: 'up' as const };
  const newPlayersTrend = { value: 15, direction: 'up' as const };
  const vipPlayersTrend = { value: 5, direction: 'up' as const };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 animate-fade-in">
      <StatCard
        title="Total Players"
        value={formatNumber(totalPlayers)}
        subtitle={`${totalPlayersTrend.value}% from last month`}
        icon={<Users className="h-5 w-5 text-white" />}
        iconColor="bg-primary/90 text-white"
        trend={totalPlayersTrend}
      />
      <StatCard
        title="Active Players"
        value={formatNumber(activePlayers)}
        subtitle={`${activePercentage}% of total players`}
        icon={<UserCheck className="h-5 w-5 text-white" />}
        iconColor="bg-green-600/90 text-white"
        trend={activePlayersTrend}
      />
      <StatCard
        title="New Players"
        value={formatNumber(newPlayers)}
        subtitle="Last 30 days"
        icon={<UserPlus className="h-5 w-5 text-white" />}
        iconColor="bg-blue-600/90 text-white"
        trend={newPlayersTrend}
      />
      <StatCard
        title="VIP Players"
        value={formatNumber(vipPlayers)}
        subtitle={`${vipPercentage}% of total players`}
        icon={<Crown className="h-5 w-5 text-white" />}
        iconColor="bg-amber-600/90 text-white"
        trend={vipPlayersTrend}
      />
    </div>
  );
};

export default PlayerStats;
