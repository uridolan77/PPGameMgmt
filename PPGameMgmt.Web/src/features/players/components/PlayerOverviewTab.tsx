import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Player, GameSession, PlayerFeature, BonusClaim } from '../types';
import { formatDate } from '../utils';
import { CalendarIcon, UserIcon, BadgeCheckIcon, CrownIcon, CoinsIcon } from 'lucide-react';

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
  // Calculate total wins and bets
  const calculateTotals = () => {
    if (!gameSessions?.length) return { totalBets: 0, totalWins: 0, netProfit: 0, profitPercentage: 0 };
    
    const totalBets = gameSessions.reduce((sum, session) => sum + session.betAmount, 0);
    const totalWins = gameSessions.reduce((sum, session) => sum + session.winAmount, 0);
    const netProfit = totalWins - totalBets;
    const profitPercentage = totalBets > 0 ? (netProfit / totalBets) * 100 : 0;
    
    return { totalBets, totalWins, netProfit, profitPercentage };
  };
  
  const { totalBets, totalWins, netProfit, profitPercentage } = calculateTotals();
  
  // Get active bonuses count
  const getActiveBonusesCount = () => {
    if (!bonusClaims) return 0;
    return bonusClaims.filter(bonus => bonus.status === 'Active').length;
  };
  
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Account Information
            </CardTitle>
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
              <div className="flex items-center">
                <CrownIcon className="h-4 w-4 mr-1 text-amber-500" />
                Level {player.playerLevel}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Segment</div>
              <div>{player.segment || 'Not assigned'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className={player.isActive ? 'text-green-600' : 'text-red-600'}>
                {player.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Login</div>
              <div>{player.lastLogin ? formatDate(player.lastLogin) : 'Never'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Game Sessions</div>
              <div>
                {sessionsLoading 
                  ? 'Loading...' 
                  : gameSessions?.length 
                    ? `${gameSessions.length} sessions` 
                    : 'No sessions'
                }
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Active Bonus Claims</div>
              <div>
                {bonusesLoading 
                  ? 'Loading...' 
                  : bonusClaims?.length 
                    ? `${getActiveBonusesCount()} active out of ${bonusClaims.length} total` 
                    : 'No bonuses'
                }
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Enabled Features</div>
              <div>
                {featuresLoading
                  ? 'Loading...'
                  : features?.length
                    ? `${features.filter(f => f.isEnabled).length} of ${features.length} features enabled`
                    : 'No features'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Financial Summary Card */}
      {!sessionsLoading && gameSessions && gameSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CoinsIcon className="h-5 w-5 mr-2" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Total Bets</div>
                <div className="text-xl font-bold">${totalBets.toFixed(2)}</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Total Wins</div>
                <div className="text-xl font-bold">${totalWins.toFixed(2)}</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Net Profit</div>
                <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)}
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Return %</div>
                <div className={`text-xl font-bold ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Feature Highlights Card */}
      {!featuresLoading && features && features.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BadgeCheckIcon className="h-5 w-5 mr-2" />
              Feature Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {features
                .filter(feature => feature.isEnabled)
                .slice(0, 6)
                .map(feature => (
                  <div key={feature.id} className="flex items-center p-2 border rounded-md">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                    <span>{feature.name}</span>
                  </div>
                ))
              }
            </div>
            {features.filter(f => f.isEnabled).length > 6 && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                +{features.filter(f => f.isEnabled).length - 6} more enabled features
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};