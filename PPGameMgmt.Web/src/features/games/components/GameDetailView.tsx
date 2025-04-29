import React from 'react';
import { Game } from '../types';
import { format } from 'date-fns';

// Import our shadcn/ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';

interface GameDetailViewProps {
  game: Game | null;
  isLoading: boolean;
  onEdit: (id: string) => void;
}

export function GameDetailView({ game, isLoading, onEdit }: GameDetailViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
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
          <Card>
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium">Provider</span>
                <span className="col-span-2">{game.provider}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium">Category</span>
                <span className="col-span-2">
                  <Badge variant="outline" className="capitalize">
                    {game.category.replace('_', ' ')}
                  </Badge>
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium">Status</span>
                <span className="col-span-2">
                  <Badge variant={game.isActive ? "success" : "destructive"}>
                    {game.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium">Release Date</span>
                <span className="col-span-2">
                  {format(new Date(game.releaseDate), 'MMMM d, yyyy')}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium">Description</span>
                <span className="col-span-2">
                  {game.description || 'No description provided.'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium">Thumbnail</span>
                <div className="col-span-2">
                  {game.thumbnailUrl ? (
                    <img 
                      src={game.thumbnailUrl} 
                      alt={game.title}
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                  ) : (
                    <span>No thumbnail available</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Statistics for this game will appear here.
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
                Game history and changes will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GameDetailView;