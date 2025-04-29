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
        <Grid container spacing={1} key={`row-${rowY}`} sx={{ mb: 1 }}>
          {rowGroups[rowY].map(item => {
            const isDragging = draggedItem && draggedItem.i === item.i;
            const isDragOver = dragOverItem && dragOverItem.i === item.i;

            // Calculate grid size based on widget width
            let gridSize = 6; // Default to half width
            if (item.w <= 4) gridSize = 4; // One third width
            if (item.w <= 3) gridSize = 3; // One quarter width

            return (
              <Grid item xs={12} md={gridSize} key={item.i}>
                <Paper
                  elevation={isDragging ? 6 : isDragOver ? 3 : 1}
                  sx={{
                    cursor: 'move',
                    opacity: isDragging ? 0.6 : 1,
                    backgroundColor: isDragOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                    height: '100%'
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDrop={(e) => handleDrop(e, item)}
                  onDragEnd={handleDragEnd}
                >
                  {widgetMap[item.i]}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};

export default SimpleGridLayout;
