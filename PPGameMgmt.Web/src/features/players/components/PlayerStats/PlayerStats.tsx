import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => (
  <Card>
    <CardContent className="p-6">
      <CardDescription className="text-sm font-medium">
        {title}
      </CardDescription>
      <div className="mt-1 mb-1">
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {subtitle && (
        <CardDescription className="text-sm">
          {subtitle}
        </CardDescription>
      )}
    </CardContent>
  </Card>
);

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

  // Calculate percentages
  const activePercentage = totalPlayers > 0 
    ? Math.round((activePlayers / totalPlayers) * 100) 
    : 0;
  
  const vipPercentage = totalPlayers > 0 
    ? Math.round((vipPlayers / totalPlayers) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Players" 
        value={formatNumber(totalPlayers)} 
        subtitle={`${formatNumber(activePlayers)} active (${activePercentage}%)`} 
      />
      <StatCard 
        title="Active Players" 
        value={formatNumber(activePlayers)} 
        subtitle={`${activePercentage}% of total players`} 
      />
      <StatCard 
        title="New Players" 
        value={formatNumber(newPlayers)} 
        subtitle="Last 30 days" 
      />
      <StatCard 
        title="VIP Players" 
        value={formatNumber(vipPlayers)} 
        subtitle={`${vipPercentage}% of total players`} 
      />
    </div>
  );
};

export default PlayerStats;
