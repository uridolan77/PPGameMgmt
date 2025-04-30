import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer, usePlayerGameSessions, usePlayerFeatures, usePlayerBonusClaims } from '../hooks';
import { useStore } from '../../../core/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  MailIcon, 
  TagIcon, 
  CalendarIcon 
} from 'lucide-react';

interface PlayerFeature {
  id: number;
  name: string;
  isEnabled: boolean;
}

interface GameSession {
  id: number;
  gameName: string;
  startTime: string;
  duration: number;
  betAmount: number;
  winAmount: number;
}

interface BonusClaim {
  id: number;
  bonusName: string;
  claimDate: string;
  value: number;
  status: string;
}

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ui } = useStore();
  
  // Convert id to number for API calls
  const playerId = id ? parseInt(id, 10) : undefined;

  // Fetch player data
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  
  // Fetch related player data
  const { data: gameSessions, isLoading: sessionsLoading } = usePlayerGameSessions(playerId);
  const { data: features, isLoading: featuresLoading } = usePlayerFeatures(playerId);
  const { data: bonusClaims, isLoading: bonusesLoading } = usePlayerBonusClaims(playerId);

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle player deletion
  const handleDeletePlayer = () => {
    // In a real app, this would show a confirmation dialog
    ui.addNotification({
      type: 'warning',
      message: 'This action would delete the player (demo only)',
      autoClose: true
    });
  };

  // Generate a consistent color from a string for avatar
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };

  if (playerLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold text-destructive">Player not found</h2>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/players')}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Players
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* Header with back button */}
        <div>
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => navigate('/players')}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Players
          </Button>
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback 
                  style={{ backgroundColor: getAvatarColor(player.username) }}
                  className="text-2xl"
                >
                  {player.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{player.username}</h1>
                <div className="flex items-center text-muted-foreground">
                  <MailIcon className="h-4 w-4 mr-1" />
                  <span>{player.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/players/edit/${player.id}`)}
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleDeletePlayer}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex gap-2 mt-4">
            <Badge variant={player.isActive ? "default" : "destructive"}>
              {player.isActive ? 'Active' : 'Inactive'}
            </Badge>
            
            <Badge variant="outline">
              Level {player.playerLevel}
            </Badge>
            
            {player.segment && (
              <Badge variant="secondary" className="flex items-center">
                <TagIcon className="h-3 w-3 mr-1" />
                {player.segment}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs for player details */}
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Game History</TabsTrigger>
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <h3 className="text-lg font-medium">Player Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
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
                    <div>{player.playerLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>{player.isActive ? 'Active' : 'Inactive'}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Last Login</div>
                    <div>{player.lastLogin ? formatDate(player.lastLogin) : 'Never'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Game Sessions</div>
                    <div>{sessionsLoading ? '...' : gameSessions?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Bonus Claims</div>
                    <div>{bonusesLoading ? '...' : bonusClaims?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Enabled Features</div>
                    <div>
                      {featuresLoading 
                        ? '...' 
                        : features?.filter((f: PlayerFeature) => f.isEnabled).length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="games" className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Game History</h3>
            {sessionsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading game history...</p>
              </div>
            ) : gameSessions && gameSessions.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md border divide-y">
                    {gameSessions.map((session: GameSession) => (
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
          </TabsContent>
          
          <TabsContent value="bonuses" className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Bonus Claims</h3>
            {bonusesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading bonus claims...</p>
              </div>
            ) : bonusClaims && bonusClaims.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md border divide-y">
                    {bonusClaims.map((bonus: BonusClaim) => (
                      <div key={bonus.id} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{bonus.bonusName}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Claimed on {formatDate(bonus.claimDate)}
                            <span className="mx-1">•</span>
                            Value: ${bonus.value.toFixed(2)}
                          </div>
                        </div>
                        <Badge variant={
                          bonus.status === 'Completed' ? 'default' :
                          bonus.status === 'Active' ? 'secondary' :
                          'destructive'
                        }>
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
          </TabsContent>
          
          <TabsContent value="features" className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Player Features</h3>
            {featuresLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading features...</p>
              </div>
            ) : features && features.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature: PlayerFeature) => (
                  <Card key={feature.id} className={`border-l-4 ${feature.isEnabled ? 'border-l-green-500' : 'border-l-destructive'}`}>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerDetail;