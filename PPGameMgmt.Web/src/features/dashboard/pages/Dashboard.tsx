import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  Paper,
  CardHeader,
  Divider
} from '@mui/material';
import { useStore } from '../../../core/store';

const Dashboard: React.FC = () => {
  const { auth, preferences } = useStore();
  const { user } = auth;
  const { dashboardWidgets } = preferences;

  const StatCard = ({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) => (
    <Paper elevation={2} sx={{ height: '100%' }}>
      <Box p={3}>
        <Typography color="text.secondary" variant="subtitle2" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, mb: 1 }} fontWeight="medium">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="body1" paragraph>
        Welcome back, {user?.username || 'User'}! Here's an overview of your platform.
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Players" 
            value="4,283" 
            subtitle="+12% from last month" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Games" 
            value="186" 
            subtitle="15 new this week" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Bonus Campaigns" 
            value="24" 
            subtitle="3 ending soon" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Avg. Session Time" 
            value="18 min" 
            subtitle="+5% from last week" 
          />
        </Grid>
      </Grid>

      {/* Customizable Widgets */}
      <Grid container spacing={3}>
        {dashboardWidgets.includes('playerStats') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Player Statistics" />
              <Divider />
              <CardContent>
                <Box height={250} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">
                    Player statistics chart will be displayed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {dashboardWidgets.includes('gameStats') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Game Performance" />
              <Divider />
              <CardContent>
                <Box height={250} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">
                    Game performance chart will be displayed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {dashboardWidgets.includes('topGames') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Games" />
              <Divider />
              <CardContent>
                <Box height={250} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">
                    Top games list will be displayed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {dashboardWidgets.includes('recentActivity') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Activity" />
              <Divider />
              <CardContent>
                <Box height={250} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">
                    Recent activity feed will be displayed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;