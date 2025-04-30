import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GameSession } from '../types';
import { CalendarIcon } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { LoadingIndicator } from './LoadingIndicator';

interface PlayerGamesTabProps {
  gameSessions?: GameSession[];
  loading: boolean;
}

export const PlayerGamesTab: React.FC<PlayerGamesTabProps> = ({ 
  gameSessions, 
  loading 
}) => {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Game History</h3>
      
      {loading ? (
        <LoadingIndicator message="Loading game history..." />
      ) : gameSessions && gameSessions.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border divide-y">
              {gameSessions.map((session) => (
                <div key={session.id} className="p-4">
                  <div className="font-medium">{session.gameName}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(session.startTime)}</span>
                      <span className="mx-1">•</span>
                      <span>Duration: {Math.round(session.duration / 60)} minutes</span>
                    </div>
                    <div className="mt-1">
                      Bet: ${session.betAmount.toFixed(2)}
                      <span className="mx-1">•</span>
                      Win: ${session.winAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
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