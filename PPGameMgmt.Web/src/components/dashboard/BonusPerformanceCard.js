import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  useTheme
} from "@mui/material";
import { CardGiftcard as BonusIcon } from "@mui/icons-material";
import { Doughnut } from "react-chartjs-2";

const BonusPerformanceCard = ({ bonusData }) => {
  const theme = useTheme();
  
  // Prepare data for the doughnut chart
  const chartData = {
    labels: bonusData?.byType ? Object.keys(bonusData.byType) : [],
    datasets: [
      {
        data: bonusData?.byType ? Object.values(bonusData.byType) : [],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <BonusIcon sx={{ mr: 1 }} /> 
          Bonus Performance
        </Typography>
        
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
          {/* Chart */}
          <Box flex={1} height={200} display="flex" justifyContent="center" alignItems="center">
            {bonusData?.byType && Object.keys(bonusData.byType).length > 0 ? (
              <Doughnut 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        boxWidth: 12
                      }
                    }
                  }
                }}
              />
            ) : (
              <Typography color="textSecondary">No bonus type data available</Typography>
            )}
          </Box>
          
          {/* Statistics */}
          <Box flex={1}>
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Conversion Rate" 
                  secondary={
                    <Box mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">{bonusData?.conversionRate || 0}%</Typography>
                        <Typography variant="body2" color="textSecondary">Target: 75%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={bonusData?.conversionRate || 0} 
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
              
              <Divider variant="middle" />
              
              <ListItem>
                <ListItemText 
                  primary="Completion Rate" 
                  secondary={
                    <Box mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">
                          {bonusData?.completed && bonusData?.claimed 
                            ? Math.round((bonusData.completed / bonusData.claimed) * 100) 
                            : 0}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Target: 60%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={bonusData?.completed && bonusData?.claimed 
                          ? Math.round((bonusData.completed / bonusData.claimed) * 100) 
                          : 0} 
                        sx={{ 
                          mt: 1, 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: theme.palette.grey[300],
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: theme.palette.success.main
                          }
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
              
              <Divider variant="middle" />
              
              <ListItem>
                <ListItemText
                  primary="Active Bonuses"
                  primaryTypographyProps={{
                    variant: "body1",
                  }}
                  secondary={bonusData?.active || 0}
                  secondaryTypographyProps={{
                    variant: "h5",
                    color: "primary",
                    fontWeight: "medium"
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BonusPerformanceCard;