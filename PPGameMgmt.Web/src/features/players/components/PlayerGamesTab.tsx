import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GameSession } from '../types';
import { CalendarIcon, ClockIcon, CoinsIcon } from 'lucide-react';
import { formatDate, formatDuration } from '../utils';
import { LoadingIndicator } from './LoadingIndicator';

interface PlayerGamesTabProps {
  gameSessions?: GameSession[];
  loading: boolean;
}

export const PlayerGamesTab: React.FC<PlayerGamesTabProps> = ({ 
  gameSessions, 
  loading 
}) => {
  // Calculate win/loss status and amount
  const getWinLoss = (bet: number, win: number) => {
    const netGain = win - bet;
    if (netGain > 0) {
      return { text: `Win: +$${netGain.toFixed(2)}`, className: 'text-green-600' };
    } else if (netGain < 0) {
      return { text: `Loss: -$${Math.abs(netGain).toFixed(2)}`, className: 'text-red-600' };
    }
    return { text: 'Break even', className: 'text-gray-600' };
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
                    <div className="font-medium">{session.gameName}</div>
                    <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(session.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CoinsIcon className="h-3 w-3" />
                        <span>Bet: ${session.betAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={`mt-2 font-medium ${winLoss.className}`}>
                      {winLoss.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No game sessions found
        </div>
      )}
    </div>
  );
};