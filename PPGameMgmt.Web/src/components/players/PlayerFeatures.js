import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import FeatureTable from '../common/FeatureTable';
import api from '../../services/api';

/**
 * Component that displays machine learning features for a specific player
 * 
 * @param {Object} props
 * @param {string} props.playerId - The ID of the player to display features for
 */
const PlayerFeatures = ({ playerId }) => {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define feature categories and their descriptions
  const featureCategories = [
    {
      name: 'Player Value Metrics',
      description: 'Metrics related to the player\'s financial value and profitability',
      features: [
        { key: 'ltv', label: 'Lifetime Value', description: 'Predicted total value of the player over their lifetime' },
        { key: 'avgDepositAmount', label: 'Average Deposit', description: 'Average amount deposited per transaction' },
        { key: 'depositFrequency', label: 'Deposit Frequency', description: 'Average number of deposits per month' },
        { key: 'profitMargin', label: 'Profit Margin', description: 'Average profit margin from player activity' },
        { key: 'monthlyValue', label: 'Monthly Value', description: 'Average monthly value generated' }
      ]
    },
    {
      name: 'Risk Indicators',
      description: 'Metrics that indicate potential risk behaviors',
      features: [
        { key: 'riskScore', label: 'Risk Score', description: 'Overall risk score based on player behavior' },
        { key: 'churnProbability', label: 'Churn Probability', description: 'Likelihood of the player churning in the next 30 days' },
        { key: 'withdrawalFrequency', label: 'Withdrawal Frequency', description: 'How often the player requests withdrawals' },
        { key: 'unusualActivityFlag', label: 'Unusual Activity', description: 'Flag for unusual activity patterns' }
      ]
    },
    {
      name: 'Engagement Metrics',
      description: 'Metrics related to how engaged the player is with the platform',
      features: [
        { key: 'avgSessionLength', label: 'Avg Session Length', description: 'Average length of gaming sessions in minutes' },
        { key: 'sessionsPerWeek', label: 'Sessions Per Week', description: 'Average number of sessions per week' },
        { key: 'daysActive', label: 'Days Active', description: 'Number of active days in the last month' },
        { key: 'loginFrequency', label: 'Login Frequency', description: 'Average number of logins per week' }
      ]
    },
    {
      name: 'Game Preferences',
      description: 'Insights into player game preferences',
      features: [
        { key: 'favoriteGameTypes', label: 'Favorite Game Types', description: 'Types of games the player engages with most' },
        { key: 'avgBetSize', label: 'Average Bet Size', description: 'Average size of bets placed' },
        { key: 'betVariability', label: 'Bet Variability', description: 'How much the player varies their bet amounts' },
        { key: 'preferredGameTime', label: 'Preferred Game Time', description: 'Time of day the player typically plays' }
      ]
    },
    {
      name: 'Responsiveness',
      description: 'How the player responds to offers and recommendations',
      features: [
        { key: 'bonusRedemptionRate', label: 'Bonus Redemption Rate', description: 'Rate at which the player redeems offered bonuses' },
        { key: 'recommendationClickRate', label: 'Recommendation Click Rate', description: 'Rate at which player clicks on personalized recommendations' },
        { key: 'promotionalEmailOpenRate', label: 'Email Open Rate', description: 'Rate at which player opens promotional emails' }
      ]
    }
  ];

  useEffect(() => {
    const fetchPlayerFeatures = async () => {
      if (!playerId) return;

      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/api/players/${playerId}/features`);
        setFeatures(response.data);
      } catch (err) {
        console.error("Error fetching player features:", err);
        setError("Unable to load player features. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerFeatures();
  }, [playerId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Player Features
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Machine learning derived features and metrics for this player based on their gaming behavior
        </Typography>
        
        <FeatureTable 
          features={features || {}} 
          categories={featureCategories} 
        />
      </CardContent>
    </Card>
  );
};

export default PlayerFeatures;