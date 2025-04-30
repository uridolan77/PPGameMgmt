import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BonusClaim } from '../types';
import { formatDate } from '../utils/dateUtils';
import { LoadingIndicator } from './LoadingIndicator';
import { BONUS_STATUS_VARIANTS } from '../utils/constants';

interface PlayerBonusesTabProps {
  bonusClaims?: BonusClaim[];
  loading: boolean;
}

export const PlayerBonusesTab: React.FC<PlayerBonusesTabProps> = ({ 
  bonusClaims, 
  loading 
}) => {
  const getBadgeVariant = (status: string) => {
    const normalizedStatus = status.toUpperCase() as keyof typeof BONUS_STATUS_VARIANTS;
    return BONUS_STATUS_VARIANTS[normalizedStatus] || 'destructive';
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Bonus Claims</h3>
      
      {loading ? (
        <LoadingIndicator message="Loading bonus claims..." />
      ) : bonusClaims && bonusClaims.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border divide-y">
              {bonusClaims.map((bonus) => (
                <div key={bonus.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{bonus.bonusName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Claimed on {formatDate(bonus.claimDate)}
                      <span className="mx-1">•</span>
                      Value: ${bonus.value.toFixed(2)}
                    </div>
                    {bonus.expiryDate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Expires on: {formatDate(bonus.expiryDate)}
                      </div>
                    )}
                  </div>
                  <Badge variant={getBadgeVariant(bonus.status)}>
                    {bonus.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No bonus claims found
        </div>
      )}
    </div>
  );
};