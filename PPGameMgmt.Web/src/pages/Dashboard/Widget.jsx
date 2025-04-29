import React, { useRef, useState } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        width: '100%',
        boxShadow: isHovered
          ? '0 8px 16px rgba(0, 0, 0, 0.12)'
          : '0 4px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: '12px',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      className="dashboard-widget"
    >
      {/* Widget Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.06)'}`,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(to right, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
          cursor: 'move',
          userSelect: 'none',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          position: 'relative',
        }}
        className="widget-header"
      >
        {/* Drag handle indicator */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30px',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.1)',
        }}></div>

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: theme.palette.mode === 'dark'
              ? theme.palette.primary.light
              : theme.palette.primary.dark,
          }}
        >
          {title}
        </Typography>

        <Box>
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, id)}
            aria-label="widget options"
            sx={{
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'rotate(90deg)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.04)',
              }
            }}
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
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          backgroundColor: theme.palette.background.paper,
        }}
        className="widget-content"
      >
        {children}
      </div>
    </div>
  );
};

export default Widget;
