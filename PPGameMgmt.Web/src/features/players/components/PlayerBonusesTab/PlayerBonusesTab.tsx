import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BonusClaim } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { LoadingIndicator } from '../../../../shared/components/LoadingIndicator';
import { BONUS_STATUS_VARIANTS } from '../../utils/constants';

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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bonus Claims</h3>
        
        {bonusClaims && bonusClaims.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {bonusClaims.length} {bonusClaims.length === 1 ? 'claim' : 'claims'}
          </div>
        )}
      </div>
      
      {loading ? (
        <LoadingIndicator message="Loading bonus claims..." />
      ) : bonusClaims && bonusClaims.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border divide-y">
              {bonusClaims.map((claim) => (
                <div key={claim.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{claim.bonusName}</h4>
                      <div className="text-sm text-muted-foreground">
                        Claimed on {formatDate(claim.claimDate)}
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(claim.status)}>
                      {claim.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Value:</span>{' '}
                      {claim.bonusValue}
                    </div>
                    
                    {claim.expiryDate && (
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{' '}
                        {formatDate(claim.expiryDate)}
                      </div>
                    )}
                    
                    {claim.wageringProgress !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Wagering:</span>{' '}
                        {claim.wageringProgress}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No bonus claims found for this player
        </div>
      )}
    </div>
  );
};
