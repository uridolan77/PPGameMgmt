import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GameSession } from '../../types';
import { CalendarIcon, ClockIcon, CoinsIcon } from 'lucide-react';
import { formatDate, formatDuration } from '../../utils';
import { LoadingIndicator } from '../../../../shared/components/LoadingIndicator';

interface PlayerGamesTabProps {
  gameSessions?: GameSession[];
  loading: boolean;
}

export const PlayerGamesTab: React.FC<PlayerGamesTabProps> = ({ 
  gameSessions, 
  loading 
}) => {
  // Helper function to calculate win/loss amount
  const getWinLoss = (betAmount: number, winAmount: number) => {
    const difference = winAmount - betAmount;
    return {
      value: Math.abs(difference),
      isPositive: difference >= 0
    };
  };
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Game History</h3>
        
        {gameSessions && gameSessions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {gameSessions.length} {gameSessions.length === 1 ? 'session' : 'sessions'}
          </div>
        )}
      </div>
      
      {loading ? (
        <LoadingIndicator message="Loading game history..." />
      ) : gameSessions && gameSessions.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border divide-y">
              {gameSessions.map((session) => {
                const winLoss = getWinLoss(session.betAmount, session.winAmount);
                
                return (
                  <div key={session.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{session.gameName}</h4>
                        <div className="text-sm text-muted-foreground">{session.gameProvider}</div>
                      </div>
                      <div className={`text-right ${winLoss.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="font-medium">
                          {winLoss.isPositive ? '+' : '-'}${winLoss.value.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bet: ${session.betAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(session.startTime)}
                      </div>
                      
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatDuration(session.duration)}
                      </div>
                      
                      <div className="flex items-center">
                        <CoinsIcon className="h-4 w-4 mr-1" />
                        {session.rounds} rounds
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No game sessions found for this player
        </div>
      )}
    </div>
  );
};
