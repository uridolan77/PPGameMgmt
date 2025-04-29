import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper } from '@mui/material';

/**
 * A draggable grid layout component that uses Material-UI Grid
 */
const SimpleGridLayout = ({ children, layouts, onLayoutChange }) => {
  // Use the lg layout for positioning
  const [currentLayout, setCurrentLayout] = useState(layouts.lg || []);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Update layout when props change
  useEffect(() => {
    setCurrentLayout(layouts.lg || []);
  }, [layouts]);

  // Group widgets by row (y position)
  const rowGroups = {};
  currentLayout.forEach(item => {
    if (!rowGroups[item.y]) {
      rowGroups[item.y] = [];
    }
    rowGroups[item.y].push(item);
  });

  // Sort rows by y position
  const sortedRows = Object.keys(rowGroups)
    .map(Number)
    .sort((a, b) => a - b);

  // Sort items within each row by x position
  sortedRows.forEach(rowY => {
    rowGroups[rowY].sort((a, b) => a.x - b.x);
  });

  // Map of widget IDs to their React elements
  const widgetMap = {};
  React.Children.forEach(children, child => {
    if (child && child.props && child.props.id) {
      widgetMap[child.props.id] = child;
    }
  });

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    // Set ghost drag image
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.i);
    }
  };

  // Handle drag over
  const handleDragOver = (e, item) => {
    e.preventDefault();
    if (draggedItem && draggedItem.i !== item.i) {
      setDragOverItem(item);
    }
  };

  // Handle drop
  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (draggedItem && targetItem && draggedItem.i !== targetItem.i) {
      // Swap positions of dragged item and target item
      const newLayout = currentLayout.map(item => {
        if (item.i === draggedItem.i) {
          return { ...item, x: targetItem.x, y: targetItem.y };
        }
        if (item.i === targetItem.i) {
          return { ...item, x: draggedItem.x, y: draggedItem.y };
        }
        return item;
      });

      setCurrentLayout(newLayout);
      if (onLayoutChange) {
        onLayoutChange(newLayout);
      }
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      {sortedRows.map(rowY => (
        <Grid
          container
          spacing={3}
          key={`row-${rowY}`}
          sx={{
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start'
          }}
        >
          {rowGroups[rowY].map(item => {
            const isDragging = draggedItem && draggedItem.i === item.i;
            const isDragOver = dragOverItem && dragOverItem.i === item.i;

            // Calculate grid size based on widget width
            // For a 12-column grid, map the widget width to Material-UI grid size
            // We directly use the width from the layout as the grid size
            // This allows for more precise control over the column widths
            let gridSize = item.w;

            // Ensure the grid size is within valid bounds (1-12)
            gridSize = Math.max(1, Math.min(12, gridSize));

            return (
              <Grid
                item
                xs={12}
                sm={gridSize >= 6 ? 12 : 6}
                md={gridSize >= 9 ? 12 : (gridSize >= 6 ? 6 : (gridSize >= 4 ? 4 : 3))}
                lg={gridSize}
                key={item.i}
              >
                <Box
                  sx={{
                    opacity: isDragging ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                    height: '100%',
                    position: 'relative',
                    '&::after': isDragOver ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: (theme) => `2px dashed ${theme.palette.mode === 'dark'
                        ? 'rgba(96, 165, 250, 0.5)'
                        : 'rgba(59, 130, 246, 0.5)'}`,
                      borderRadius: '12px',
                      pointerEvents: 'none',
                      zIndex: 10
                    } : {}
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDrop={(e) => handleDrop(e, item)}
                  onDragEnd={handleDragEnd}
                >
                  {widgetMap[item.i]}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};

export default SimpleGridLayout;
