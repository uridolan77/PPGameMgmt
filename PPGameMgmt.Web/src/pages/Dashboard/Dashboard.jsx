import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
// No longer using react-grid-layout
// import { Responsive } from 'react-grid-layout';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// Import our dashboard store
import useDashboardStore from '../../stores/dashboardStore';

// Import modular components and configurations
import WIDGET_COMPONENTS from './widgetRegistry';
import Widget from './Widget';
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
    setActiveWidgets
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

    // Force a re-render after a short delay to ensure layout is applied
    const timer = setTimeout(() => {
      console.log('Forcing resize event');
      window.dispatchEvent(new Event('resize'));

      // Add another resize event after a longer delay
      setTimeout(() => {
        console.log('Forcing second resize event');
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeWidgets]);

  // Add a useEffect to monitor layout changes
  useEffect(() => {
    console.log('Layouts updated:', layouts);
  }, [layouts]);

  // Force resize events when component mounts
  useEffect(() => {
    console.log('Dashboard component mounted');

    // Schedule multiple resize events to ensure layout is applied
    const timers = [
      setTimeout(() => {
        console.log('Forcing resize event on mount 1');
        window.dispatchEvent(new Event('resize'));
      }, 500),
      setTimeout(() => {
        console.log('Forcing resize event on mount 2');
        window.dispatchEvent(new Event('resize'));
      }, 1500),
      setTimeout(() => {
        console.log('Forcing resize event on mount 3');
        window.dispatchEvent(new Event('resize'));
      }, 3000)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

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
    addWidget(widgetId);
    handleAddMenuClose();
    // Reload to update layout
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
    // Reload to update layout
    window.location.reload();
  };

  // Get available widgets that aren't already on the dashboard
  const availableToAdd = Object.keys(availableWidgets)
    .filter(id => !activeWidgets.includes(id));

  return (
    <Box sx={{
      width: '100%',
      padding: 2,
      maxWidth: '100%',
      boxSizing: 'border-box',
      '& .custom-grid-layout': {
        display: 'grid',
        // Use auto-fit to automatically determine the number of columns
        // minmax(300px, 1fr) means each column is at least 300px wide
        // and they share the available space equally
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        width: '100%',
        // Add responsive behavior
        '@media (max-width: 1200px)': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        },
        '@media (max-width: 900px)': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        },
        '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr', // Single column on small screens
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
              window.location.reload();
            }}
          >
            Reset Dashboard
          </Button>
        </Box>
      </Box>

      {/* Grid Layout with Widgets */}
      <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
        {/* Custom grid layout instead of ResponsiveGridLayout */}
        <div
          className="custom-grid-layout"
          style={{
            display: 'grid',
            // The actual columns are controlled by the CSS above
            // This is just a fallback
            gap: '16px',
            width: '100%'
          }}
        >
        {activeWidgets.map((widgetId, index) => {
          const WidgetComponent = WIDGET_COMPONENTS[widgetId] || (() => <div>Widget not found</div>);
          const widgetConfig = availableWidgets[widgetId];

          return (
            <div
              key={widgetId}
              className={`grid-item ${draggedWidgetId === widgetId ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                e.currentTarget.classList.add('dragging-over');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('dragging-over');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('dragging-over');

                // Get the dragged widget ID
                const draggedId = e.dataTransfer.getData('text/plain');
                console.log(`Dropping widget ${draggedId} at index ${index}`);

                if (draggedId && draggedId !== widgetId) {
                  // Reorder the widgets
                  const newActiveWidgets = [...activeWidgets];
                  const draggedIndex = newActiveWidgets.indexOf(draggedId);

                  // Remove the dragged widget
                  newActiveWidgets.splice(draggedIndex, 1);

                  // Insert it at the target position
                  const insertIndex = newActiveWidgets.indexOf(widgetId);
                  newActiveWidgets.splice(insertIndex, 0, draggedId);

                  // Update the active widgets
                  setActiveWidgets(newActiveWidgets);

                  // Force a resize event
                  setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                  }, 100);
                }
              }}
            >
              <Widget
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
            </div>
          );
        })}
        </div>
      </div>

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