import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerFeature } from '../types';
import { LoadingIndicator } from './LoadingIndicator';

interface PlayerFeaturesTabProps {
  features?: PlayerFeature[];
  loading: boolean;
}

export const PlayerFeaturesTab: React.FC<PlayerFeaturesTabProps> = ({ 
  features, 
  loading 
}) => {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Player Features</h3>
      
      {loading ? (
        <LoadingIndicator message="Loading features..." />
      ) : features && features.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className={`border-l-4 ${feature.isEnabled ? 'border-l-green-500' : 'border-l-destructive'}`}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div className="font-medium">{feature.name}</div>
                <Badge variant={feature.isEnabled ? 'default' : 'destructive'}>
                  {feature.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No features found
        </div>
      )}
    </div>
  );
};