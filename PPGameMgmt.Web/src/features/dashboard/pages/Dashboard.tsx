import React from 'react';
import { useStore } from '../../../core/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard: React.FC = () => {
  const { auth, preferences } = useStore();
  const { user } = auth;
  const { dashboardWidgets } = preferences;

  const StatCard = ({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) => (
    <Card>
      <CardContent className="p-6">
        <CardDescription className="text-sm font-medium">
          {title}
        </CardDescription>
        <div className="mt-1 mb-1">
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {subtitle && (
          <CardDescription className="text-sm">
            {subtitle}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username || 'User'}! Here's an overview of your platform.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Players" 
            value="4,283" 
            subtitle="+12% from last month" 
          />
          <StatCard 
            title="Active Games" 
            value="186" 
            subtitle="15 new this week" 
          />
          <StatCard 
            title="Bonus Campaigns" 
            value="24" 
            subtitle="3 ending soon" 
          />
          <StatCard 
            title="Avg. Session Time" 
            value="18 min" 
            subtitle="+5% from last week" 
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {dashboardWidgets.includes('playerStats') && (
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Player Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Player statistics chart will be displayed here
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {dashboardWidgets.includes('gameStats') && (
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Game Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Game performance chart will be displayed here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {dashboardWidgets.includes('topGames') && (
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Games</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Top games list will be displayed here
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {dashboardWidgets.includes('recentActivity') && (
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Recent activity feed will be displayed here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="players" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Overview</CardTitle>
                <CardDescription>Track all your player metrics in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed player statistics will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Games Overview</CardTitle>
                <CardDescription>Monitor your game performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed game statistics will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Track all recent activities across your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Activity feed will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;