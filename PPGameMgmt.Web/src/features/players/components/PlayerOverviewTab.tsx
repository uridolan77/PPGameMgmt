import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Player, GameSession, PlayerFeature, BonusClaim } from '../types';
import { formatDate } from '../utils/dateUtils';

interface PlayerOverviewTabProps {
  player: Player;
  gameSessions?: GameSession[];
  features?: PlayerFeature[];
  bonusClaims?: BonusClaim[];
  sessionsLoading: boolean;
  featuresLoading: boolean;
  bonusesLoading: boolean;
}

export const PlayerOverviewTab: React.FC<PlayerOverviewTabProps> = ({
  player,
  gameSessions,
  features,
  bonusClaims,
  sessionsLoading,
  featuresLoading,
  bonusesLoading,
}) => {
  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-medium">Player Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Username</div>
              <div>{player.username}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{player.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Player Level</div>
              <div>{player.playerLevel}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div>{player.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Login</div>
              <div>{player.lastLogin ? formatDate(player.lastLogin) : 'Never'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Game Sessions</div>
              <div>{sessionsLoading ? '...' : gameSessions?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Bonus Claims</div>
              <div>{bonusesLoading ? '...' : bonusClaims?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Enabled Features</div>
              <div>
                {featuresLoading
                  ? '...'
                  : features?.filter(f => f.isEnabled).length || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};