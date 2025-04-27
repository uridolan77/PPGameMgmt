import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tooltip,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import { Info, TrendingUp, TrendingDown, Warning } from '@mui/icons-material';

/**
 * A flexible component for displaying machine learning features in a table format
 * 
 * @param {Object} props
 * @param {Object} props.features - Object containing the features to display
 * @param {Array} props.categories - Array of category objects that define how features are grouped
 * @param {string} props.title - Optional table title
 * @param {Object} props.formatters - Optional custom formatter functions for specific features
 */
const FeatureTable = ({ features, categories, title, formatters = {} }) => {
  if (!features || Object.keys(features).length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
          <Typography variant="body1" color="text.secondary">
            No feature data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  const getFeatureValue = (feature) => {
    if (formatters[feature] && typeof formatters[feature] === 'function') {
      return formatters[feature](features[feature]);
    }

    const value = features[feature];
    
    // Handle different value types
    if (value === null || value === undefined) {
      return 'N/A';
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    } else if (typeof value === 'number') {
      // Format percentages if value is between 0 and 1
      if (feature.toLowerCase().includes('rate') || feature.toLowerCase().includes('probability')) {
        return `${(value * 100).toFixed(1)}%`;
      }
      // Format currency values
      if (feature.toLowerCase().includes('value') || 
          feature.toLowerCase().includes('deposit') || 
          feature.toLowerCase().includes('withdrawal') ||
          feature.toLowerCase().includes('amount')) {
        return `$${value.toFixed(2)}`;
      }
      // Regular numbers
      return value % 1 === 0 ? value.toString() : value.toFixed(2);
    } else if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value instanceof Date) {
      return value.toLocaleDateString();
    } else {
      return value.toString();
    }
  };

  const getFeatureVisualIndicator = (feature) => {
    const value = features[feature];
    
    // Don't show indicators for null values or non-numeric types
    if (value === null || value === undefined || typeof value !== 'number') {
      return null;
    }

    // Special indicators for specific feature types
    if (feature === 'riskScore' || feature === 'churnProbability') {
      // For risk scores: red if high risk (> 0.7), yellow if medium (0.3-0.7), green otherwise
      if (value > 0.7) {
        return <Warning sx={{ color: 'error.main', ml: 1 }} fontSize="small" />;
      } else if (value > 0.3) {
        return <Warning sx={{ color: 'warning.main', ml: 1 }} fontSize="small" />;
      } else {
        return <Chip size="small" label="Low" color="success" sx={{ ml: 1 }} />;
      }
    } 
    
    // For metrics that are better when higher (values, session lengths, etc.)
    if (feature.toLowerCase().includes('value') || 
        feature.toLowerCase().includes('deposit') || 
        feature.toLowerCase().includes('session') || 
        feature.toLowerCase().includes('frequency')) {
      return value > 0 ? 
        <TrendingUp fontSize="small" color="success" sx={{ ml: 1 }} /> : 
        <TrendingDown fontSize="small" color="error" sx={{ ml: 1 }} />;
    }

    return null;
  };

  return (
    <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
      )}
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Feature</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <React.Fragment key={category.name}>
              {/* Category header */}
              <TableRow sx={{ backgroundColor: 'action.selected' }}>
                <TableCell colSpan={2} sx={{ py: 1 }}>
                  <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
                    {category.name}
                    {category.description && (
                      <Tooltip title={category.description}>
                        <Info fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', opacity: 0.7 }} />
                      </Tooltip>
                    )}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Category features */}
              {category.features.map((feature) => (
                <TableRow key={feature.key}>
                  <TableCell sx={{ maxWidth: '50%' }}>
                    <Tooltip title={feature.description || ''} arrow placement="top-start">
                      <Typography variant="body2">
                        {feature.label || feature.key}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {getFeatureValue(feature.key)}
                      </Typography>
                      {getFeatureVisualIndicator(feature.key)}
                    </Box>
                    
                    {/* Progress bars for percentage values */}
                    {typeof features[feature.key] === 'number' && 
                     (feature.key.toLowerCase().includes('rate') || 
                      feature.key.toLowerCase().includes('probability')) && (
                      <LinearProgress 
                        variant="determinate" 
                        value={features[feature.key] * 100} 
                        sx={{ 
                          mt: 0.5, 
                          height: 4, 
                          borderRadius: 1,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: features[feature.key] > 0.7 ? 'error.main' : 
                                            features[feature.key] > 0.3 ? 'warning.main' : 'success.main'
                          }
                        }} 
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FeatureTable;