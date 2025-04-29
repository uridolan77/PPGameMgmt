import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Menu, MenuItem, IconButton, Grid, Paper } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

// Import our dashboard store
import useDashboardStore from '../../stores/dashboardStore';

// Import dashboard-specific styles
import '../../styles/dashboard.css';

// Import modular components and configurations
import WIDGET_COMPONENTS from './widgetRegistry';
import Widget from './Widget';
import SimpleGridLayout from './SimpleGridLayout';
import { createLayouts } from './layoutConfig';

const Dashboard = () => {
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
    resetDashboard,
    setActiveWidgets,
    layout,
    updateLayout
  } = useDashboardStore();

  // Get initial layouts for all breakpoints
  const initialLayouts = createLayouts(activeWidgets);

  // State to track current layout
  const [layouts, setLayouts] = useState(initialLayouts);

  // Update layouts when active widgets change
  useEffect(() => {
    console.log('Active widgets changed:', activeWidgets);
    const newLayouts = createLayouts(activeWidgets);
    console.log('New layouts:', newLayouts);
    setLayouts(newLayouts);

    // Force a resize event to ensure the layout is properly rendered
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [activeWidgets]);

  // Handle layout change
  const handleLayoutChange = (currentLayout, allLayouts) => {
    console.log('Layout changed:', allLayouts);
    setLayouts(allLayouts);
    updateLayout(allLayouts);
  };

  // State for tracking dragged widgets
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);

  // Handlers for widget menu
  const handleAddMenuOpen = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddWidget = (widgetId) => {
    // Add the widget to the store
    addWidget(widgetId);
    handleAddMenuClose();

    // Get the updated list of widgets (including the new one)
    const updatedWidgets = [...activeWidgets, widgetId];

    // Create new layouts for all breakpoints
    const newLayouts = createLayouts(updatedWidgets);

    // Update the layouts state
    setLayouts(newLayouts);

    // Update the layout in the store
    updateLayout(newLayouts);

    // Force a resize event to ensure the layout is properly rendered
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
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
      // Remove the widget from the store
      removeWidget(selectedWidgetId);

      // Get the updated list of widgets (without the removed one)
      const updatedWidgets = activeWidgets.filter(id => id !== selectedWidgetId);

      // Create new layouts for all breakpoints
      const newLayouts = createLayouts(updatedWidgets);

      // Update the layouts state
      setLayouts(newLayouts);

      // Update the layout in the store
      updateLayout(newLayouts);

      // Force a resize event to ensure the layout is properly rendered
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
    handleWidgetMenuClose();
  };

  // Get available widgets that aren't already on the dashboard
  const availableToAdd = Object.keys(availableWidgets)
    .filter(id => !activeWidgets.includes(id));

  return (
    <Box sx={{
      width: '100%',
      padding: 3,
      maxWidth: '100%',
      boxSizing: 'border-box',
      backgroundColor: (theme) => theme.palette.background.default,
      '& .custom-grid-layout': {
        display: 'grid',
        // Use auto-fit to automatically determine the number of columns
        // minmax(300px, 1fr) means each column is at least 300px wide
        // and they share the available space equally
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        width: '100%',
        // Add responsive behavior
        '@media (max-width: 1200px)': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        },
        '@media (max-width: 900px)': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        },
        '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr', // Single column on small screens
          gap: '16px',
        }
      },
      '& .grid-item': {
        // Add styling to grid items
        transition: 'all 200ms ease',
        position: 'relative',
        minHeight: '250px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&.dragging-over': {
          outline: '2px dashed #2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-8px',
          left: 0,
          right: 0,
          height: '16px',
          zIndex: 10,
          transition: 'background-color 0.2s ease'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-8px',
          left: 0,
          right: 0,
          height: '16px',
          zIndex: 10,
          transition: 'background-color 0.2s ease'
        },
        '&.dragging-over::before, &.dragging-over::after': {
          backgroundColor: '#2196f3'
        }
      },
      // Style for dragging widgets
      '@global': {
        '.dragging': {
          opacity: '0.7',
          transform: 'scale(0.95)',
          zIndex: 1000,
          boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
        }
      }
    }}>
      {/* Dashboard Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          pb: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.06)'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #60a5fa, #a78bfa)'
                : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 2
            }}
          >
            Dashboard
          </Typography>

          <IconButton
            onClick={() => {
              const newTheme = localStorage.getItem('preferred-theme') === 'dark' ? 'light' : 'dark';
              localStorage.setItem('preferred-theme', newTheme);
              window.location.reload();
            }}
            sx={{
              ml: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            {localStorage.getItem('preferred-theme') === 'dark'
              ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            }
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMenuOpen}
            sx={{
              borderRadius: '8px',
              borderWidth: '2px',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderWidth: '2px',
              }
            }}
          >
            Add Widget
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              resetDashboard();
              // Reset layouts to default
              const defaultWidgets = [
                'playerStats',
                'gameStats',
                'topGames',
                'bonusStats',
                'recentActivity',
                'playerSegments',
                'gameRecommendations',
                'bonusEffectiveness'
              ];
              const newLayouts = createLayouts(defaultWidgets);
              setLayouts(newLayouts);

              // Force a resize event to ensure the layout is properly rendered
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 100);
            }}
            sx={{
              borderRadius: '8px',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(96, 165, 250, 0.2)'
                : '0 4px 12px rgba(59, 130, 246, 0.2)',
            }}
          >
            Reset Dashboard
          </Button>
        </Box>
      </Box>

      {/* Grid Layout with Widgets */}
      <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
        <SimpleGridLayout
          layouts={layouts}
          onLayoutChange={(newLayout) => {
            const allLayouts = { ...layouts, lg: newLayout };
            setLayouts(allLayouts);
            updateLayout(allLayouts);
          }}
        >
          {activeWidgets.map((widgetId) => {
            const WidgetComponent = WIDGET_COMPONENTS[widgetId] || (() => <div>Widget not found</div>);
            const widgetConfig = availableWidgets[widgetId];

            return (
              <Widget
                key={widgetId}
                id={widgetId}
                title={widgetConfig.title}
                onMenuOpen={handleWidgetMenuOpen}
                onDragStart={(_, id) => {
                  console.log('Widget drag started:', id);
                  setDraggedWidgetId(id);
                }}
                onDragEnd={(_, id) => {
                  console.log('Widget drag ended:', id);
                  setDraggedWidgetId(null);
                }}
              >
                <WidgetComponent
                  settings={widgetSettings[widgetId]}
                  onSettingsChange={(newSettings) => updateWidgetSettings(widgetId, newSettings)}
                />
              </Widget>
            );
          })}
        </SimpleGridLayout>
      </div>

      {/* Add Widget Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 220,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {availableToAdd.length === 0 ? (
          <MenuItem
            disabled
            sx={{
              py: 1.5,
              px: 2.5,
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              All widgets are already added
            </Typography>
          </MenuItem>
        ) : (
          availableToAdd.map(widgetId => (
            <MenuItem
              key={widgetId}
              onClick={() => handleAddWidget(widgetId)}
              sx={{
                py: 1.5,
                px: 2.5,
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {availableWidgets[widgetId].title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
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
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 180,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={handleRemoveWidget}
          sx={{
            py: 1.5,
            px: 2.5,
            borderRadius: 1,
            mx: 0.5,
            my: 0.25,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 0, 0, 0.1)'
                : 'rgba(255, 0, 0, 0.04)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <CloseIcon fontSize="small" sx={{ marginRight: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Remove Widget
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard;