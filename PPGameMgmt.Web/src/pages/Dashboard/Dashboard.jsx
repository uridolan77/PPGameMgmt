import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import our dashboard store and widgets
import useDashboardStore from '../../stores/dashboardStore';

// Import widget components
import PlayerStatsWidget from '../../components/dashboard/widgets/PlayerStatsWidget';
import GameStatsWidget from '../../components/dashboard/widgets/GameStatsWidget';
import TopGamesWidget from '../../components/dashboard/widgets/TopGamesWidget';
import BonusStatsWidget from '../../components/dashboard/widgets/BonusStatsWidget';
import RecentActivityWidget from '../../components/dashboard/widgets/RecentActivityWidget';
import PlayerSegmentsWidget from '../../components/dashboard/widgets/PlayerSegmentsWidget';
import GameRecommendationsWidget from '../../components/dashboard/widgets/GameRecommendationsWidget';
import BonusEffectivenessWidget from '../../components/dashboard/widgets/BonusEffectivenessWidget';
import PlayerRetentionWidget from '../../components/dashboard/widgets/PlayerRetentionWidget';

// Map widget IDs to their component implementations
const WIDGET_COMPONENTS = {
  playerStats: PlayerStatsWidget,
  gameStats: GameStatsWidget,
  topGames: TopGamesWidget,
  bonusStats: BonusStatsWidget,
  recentActivity: RecentActivityWidget,
  playerSegments: PlayerSegmentsWidget,
  gameRecommendations: GameRecommendationsWidget,
  bonusEffectiveness: BonusEffectivenessWidget,
  playerRetention: PlayerRetentionWidget
};

const Dashboard = () => {
  // No need for grid configuration or fixed layouts anymore
  // We're using a simple MUI Grid system instead

  // State for widget menu
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [activeWidgetMenuAnchor, setActiveWidgetMenuAnchor] = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);

  // Get dashboard configuration from our store
  const {
    availableWidgets,
    activeWidgets,
    widgetSettings,
    addWidget,
    removeWidget,
    updateWidgetSettings,
    resetDashboard
  } = useDashboardStore();

  // Handlers for widget menu
  const handleAddMenuOpen = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddWidget = (widgetId) => {
    addWidget(widgetId);
    handleAddMenuClose();

    // After adding a widget, we need to refresh the page to update the layout
    // This is a simple solution to ensure the new widget appears in the correct position
    window.location.reload();
  };

  const handleWidgetMenuOpen = (event, widgetId) => {
    event.stopPropagation();
    setSelectedWidgetId(widgetId);
    setActiveWidgetMenuAnchor(event.currentTarget);
  };

  const handleWidgetMenuClose = () => {
    setActiveWidgetMenuAnchor(null);
    setSelectedWidgetId(null);
  };

  const handleRemoveWidget = () => {
    if (selectedWidgetId) {
      removeWidget(selectedWidgetId);
    }
    handleWidgetMenuClose();

    // Reload the page to update the layout after removing a widget
    window.location.reload();
  };

  // This function is now used directly in the onLayoutChange prop of ResponsiveGridLayout

  // Get available widgets that aren't already on the dashboard
  const availableToAdd = Object.keys(availableWidgets)
    .filter(id => !activeWidgets.includes(id));

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4" component="h1">Dashboard</Typography>

        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMenuOpen}
            sx={{ mr: 1 }}
          >
            Add Widget
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              resetDashboard();
              // Reload the page to apply the reset layout
              window.location.reload();
            }}
          >
            Reset Dashboard
          </Button>
        </Box>
      </Box>

      {/* Simple grid layout using MUI Grid instead of ResponsiveGridLayout */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr', lg: '1fr 1fr' },
          gap: 3,
          '& > *:nth-of-type(odd)': { gridColumn: { xs: '1', md: '1' } },
          '& > *:nth-of-type(even)': { gridColumn: { xs: '1', md: '2' } }
        }}>
          {activeWidgets.map(widgetId => {
            const WidgetComponent = WIDGET_COMPONENTS[widgetId] || (() => <div>Widget not found</div>);
            const widgetConfig = availableWidgets[widgetId];

            return (
              <Box
                key={widgetId}
                sx={{
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                  height: widgetId === 'topGames' || widgetId === 'recentActivity' || widgetId === 'playerSegments' ? '400px' : '300px',
                  marginBottom: 3,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {/* Widget Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    backgroundColor: 'rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {widgetConfig.title}
                  </Typography>

                  <Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleWidgetMenuOpen(e, widgetId)}
                      aria-label="widget options"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Widget Content */}
                <Box
                  sx={{
                    height: 'calc(100% - 41px)', // Subtract header height
                    overflow: 'auto',
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch'
                  }}
                >
                  <WidgetComponent
                    settings={widgetSettings[widgetId]}
                    onSettingsChange={(newSettings) => updateWidgetSettings(widgetId, newSettings)}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Add Widget Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
      >
        {availableToAdd.length === 0 ? (
          <MenuItem disabled>All widgets added</MenuItem>
        ) : (
          availableToAdd.map(widgetId => (
            <MenuItem key={widgetId} onClick={() => handleAddWidget(widgetId)}>
              <Box>
                <Typography variant="body1">
                  {availableWidgets[widgetId].title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {availableWidgets[widgetId].description}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Active Widget Menu */}
      <Menu
        anchorEl={activeWidgetMenuAnchor}
        open={Boolean(activeWidgetMenuAnchor)}
        onClose={handleWidgetMenuClose}
      >
        <MenuItem onClick={handleRemoveWidget}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <CloseIcon fontSize="small" sx={{ marginRight: 1 }} />
            Remove Widget
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard;