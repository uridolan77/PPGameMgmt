import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, SxProps, Theme, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../../../core/theme/ThemeContext';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: {
    icon: React.ReactNode;
    text: string;
    color: string;
  };
  sx?: SxProps<Theme>;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'primary.light',
  trend,
  sx
}) => {
  const theme = useTheme();
  let currentTheme;

  try {
    // Try to get the theme context, but don't fail if it's not available
    currentTheme = useThemeContext().currentTheme;
  } catch (error) {
    // Fallback to default values if theme context is not available
    currentTheme = {
      borderRadius: 4,
      fontFamily: theme.typography.fontFamily
    };
  }

  // Apply theme-specific styling
  const cardStyle = {
    ...sx,
    boxShadow: theme.shadows[2],
    borderRadius: `${currentTheme.borderRadius}px`,
  };

  return (
    <StyledCard sx={cardStyle}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              fontWeight="bold"
              sx={{
                my: 1,
                fontFamily: currentTheme.fontFamily
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {trend.icon}
                <Typography variant="body2" sx={{ ml: 0.5, color: trend.color }}>
                  {trend.text}
                </Typography>
              </Box>
            )}
            {subtitle && !trend && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: iconColor,
              p: 1,
              borderRadius: `${currentTheme.borderRadius * 0.5}px`
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
