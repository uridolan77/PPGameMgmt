import React from 'react';
import { Game } from '../../types';
import { formatDate } from '../../../../shared/utils/formatting';
import { OptimizedImage } from '../../../../shared/components';

// Import our shadcn/ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GameDetailViewProps {
  game: Game | null;
  isLoading: boolean;
  onEdit: (id: number) => void;
}

/**
 * A component for displaying detailed game information
 */
export const GameDetailView: React.FC<GameDetailViewProps> = ({
  game,
  isLoading,
  onEdit
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 col-span-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (!game) {
    return (
      <Alert>
        <AlertTitle>Game not found</AlertTitle>
        <AlertDescription>
          The game you are looking for does not exist or has been removed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{game.title}</h1>
        <Button onClick={() => onEdit(game.id)}>Edit Game</Button>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Game thumbnail */}
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <div className="aspect-square rounded-md overflow-hidden">
                  {game.thumbnailUrl ? (
                    <OptimizedImage
                      src={game.thumbnailUrl}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Game details */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Game Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Provider</div>
                  <div className="col-span-2">{game.provider}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="capitalize">
                      {game.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="col-span-2">
                    <Badge variant={game.isActive ? "default" : "destructive"}>
                      {game.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Release Date</div>
                  <div className="col-span-2">{formatDate(game.releaseDate)}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Popularity</div>
                  <div className="col-span-2">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`inline-block w-4 h-4 rounded-full mx-0.5 ${
                          i < game.popularity ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {game.features && game.features.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-muted-foreground">Features</div>
                    <div className="col-span-2 flex flex-wrap gap-2">
                      {game.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-sm">{game.description}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Statistics for this game are not available yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                History for this game is not available yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
