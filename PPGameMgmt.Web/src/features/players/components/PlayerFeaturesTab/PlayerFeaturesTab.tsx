import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PlayerFeature } from '../../types';
import { LoadingIndicator } from '../../../../shared/components/LoadingIndicator';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface PlayerFeaturesTabProps {
  features?: PlayerFeature[];
  loading: boolean;
  onToggleFeature?: (feature: PlayerFeature) => void;
  isReadOnly?: boolean;
}

interface FeatureCardProps {
  feature: PlayerFeature;
  onToggle?: (feature: PlayerFeature) => void;
  isReadOnly: boolean;
}

export const PlayerFeaturesTab: React.FC<PlayerFeaturesTabProps> = ({
  features,
  loading,
  onToggleFeature,
  isReadOnly = true
}) => {
  // Group features by enabled status for better organization
  const getGroupedFeatures = () => {
    if (!features) return { enabled: [], disabled: [] };

    return {
      enabled: features.filter(f => f.isEnabled),
      disabled: features.filter(f => !f.isEnabled)
    };
  };

  const { enabled, disabled } = getGroupedFeatures();

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Player Features</h3>

        {features && features.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {enabled.length} of {features.length} features enabled
          </div>
        )}
      </div>

      {loading ? (
        <LoadingIndicator message="Loading features..." />
      ) : features && features.length > 0 ? (
        <>
          {/* Enabled features section */}
          {enabled.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                Enabled Features
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enabled.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={onToggleFeature}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Disabled features section */}
          {disabled.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                Disabled Features
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {disabled.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={onToggleFeature}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No features found for this player
        </div>
      )}
    </div>
  );
};

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onToggle, isReadOnly }) => {
  return (
    <Card className={`border-l-4 ${feature.isEnabled ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{feature.name}</span>
          <Badge variant={feature.isEnabled ? 'default' : 'destructive'} className="ml-2">
            {feature.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {!isReadOnly && onToggle && (
          <div className="flex items-center justify-end mt-2">
            <Switch
              checked={feature.isEnabled}
              onCheckedChange={() => onToggle(feature)}
              aria-label={`Toggle ${feature.name}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
