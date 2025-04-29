import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

/**
 * Widget component that renders a single dashboard widget
 * with a header and content area
 */
const Widget = ({
  id,
  title,
  layoutItem,
  onMenuOpen,
  children,
  onDragStart,
  onDragEnd
}) => {
  const widgetRef = useRef(null);

  const handleDragStart = (e) => {
    // Set the drag data
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';

    // Add a class to style the widget during drag
    if (widgetRef.current) {
      widgetRef.current.classList.add('dragging');
    }

    // Call the parent's onDragStart if provided
    if (onDragStart) {
      onDragStart(e, id);
    }
  };

  const handleDragEnd = (e) => {
    // Remove the dragging class
    if (widgetRef.current) {
      widgetRef.current.classList.remove('dragging');
    }

    // Call the parent's onDragEnd if provided
    if (onDragEnd) {
      onDragEnd(e, id);
    }
  };

  return (
    <div
      ref={widgetRef}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        width: '100%',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        backgroundColor: '#fff',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}
    >
      {/* Widget Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          cursor: 'move',
          userSelect: 'none'
        }}
        className="react-grid-item-handle"
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>

        <Box>
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, id)}
            aria-label="widget options"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </div>

      {/* Widget Content */}
      <div
        style={{
          flex: 1, // Take remaining space
          overflow: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Widget;
