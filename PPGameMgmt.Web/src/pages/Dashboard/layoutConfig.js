/**
 * Dashboard layout configuration
 * This file contains the layout configurations for different screen sizes
 */

// Create layout configurations for the dashboard
export const createLayouts = (activeWidgets) => {
  // Helper function to create layouts based on active widgets
  const createLayoutForActiveWidgets = (baseLayout) => {
    // Create a new layout for active widgets
    return activeWidgets.map((widgetId, index) => {
      // Find the base layout item for this widget
      const baseItem = baseLayout.find(item => item.i === widgetId);

      // For large screens (lg), position in a 2-column grid
      if (baseLayout === lgLayoutBase) {
        return {
          i: widgetId,
          x: index % 2 * 6, // Alternate between x=0 and x=6
          y: Math.floor(index / 2) * 3, // New row every 2 widgets
          w: 6,
          h: baseItem ? baseItem.h : 2,
          minW: 3,
          maxW: 12,
          static: false,
          isDraggable: true,
          isResizable: false
        };
      }
      // For medium screens (md), position in a 2-column grid
      else if (baseLayout === mdLayoutBase) {
        return {
          i: widgetId,
          x: index % 2 * 5, // Alternate between x=0 and x=5
          y: Math.floor(index / 2) * 3, // New row every 2 widgets
          w: 5,
          h: baseItem ? baseItem.h : 2,
          minW: 3,
          maxW: 10,
          static: false,
          isDraggable: true,
          isResizable: false
        };
      }
      // For smaller screens, stack vertically
      else {
        const colWidth = baseLayout === smLayoutBase ? 6 :
                         baseLayout === xsLayoutBase ? 4 : 2;
        return {
          i: widgetId,
          x: 0,
          y: index * 3, // Stack vertically with some spacing
          w: colWidth,
          h: baseItem ? baseItem.h : 2,
          static: false,
          isDraggable: true,
          isResizable: false
        };
      }
    });
  };

  // Base layouts for all possible widgets - Large screens (12 columns)
  // Note: x and y are in grid units, not pixels
  const lgLayoutBase = [
    { i: 'playerStats', x: 0, y: 0, w: 6, h: 2, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'gameStats', x: 6, y: 0, w: 6, h: 2, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'topGames', x: 0, y: 2, w: 6, h: 3, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusStats', x: 6, y: 2, w: 6, h: 2, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'recentActivity', x: 0, y: 5, w: 6, h: 3, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'playerSegments', x: 6, y: 5, w: 6, h: 3, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'gameRecommendations', x: 0, y: 8, w: 6, h: 3, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusEffectiveness', x: 6, y: 8, w: 6, h: 3, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false },
    { i: 'playerRetention', x: 0, y: 11, w: 12, h: 3, minW: 3, maxW: 12, static: false, isDraggable: true, isResizable: false }
  ];

  // For medium screens (10 columns)
  const mdLayoutBase = [
    { i: 'playerStats', x: 0, y: 0, w: 5, h: 2, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'gameStats', x: 5, y: 0, w: 5, h: 2, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'topGames', x: 0, y: 2, w: 5, h: 3, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusStats', x: 5, y: 2, w: 5, h: 2, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'recentActivity', x: 0, y: 5, w: 5, h: 3, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'playerSegments', x: 5, y: 5, w: 5, h: 3, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'gameRecommendations', x: 0, y: 8, w: 5, h: 3, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusEffectiveness', x: 5, y: 8, w: 5, h: 3, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false },
    { i: 'playerRetention', x: 0, y: 11, w: 10, h: 3, minW: 3, maxW: 10, static: false, isDraggable: true, isResizable: false }
  ];

  // For small screens (6 columns)
  const smLayoutBase = [
    { i: 'playerStats', x: 0, y: 0, w: 6, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'gameStats', x: 0, y: 2, w: 6, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'topGames', x: 0, y: 4, w: 6, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusStats', x: 0, y: 7, w: 6, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'recentActivity', x: 0, y: 9, w: 6, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'playerSegments', x: 0, y: 12, w: 6, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'gameRecommendations', x: 0, y: 15, w: 6, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusEffectiveness', x: 0, y: 18, w: 6, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'playerRetention', x: 0, y: 21, w: 6, h: 3, static: false, isDraggable: true, isResizable: false }
  ];

  // For extra small screens (4 columns)
  const xsLayoutBase = [
    { i: 'playerStats', x: 0, y: 0, w: 4, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'gameStats', x: 0, y: 2, w: 4, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'topGames', x: 0, y: 4, w: 4, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusStats', x: 0, y: 7, w: 4, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'recentActivity', x: 0, y: 9, w: 4, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'playerSegments', x: 0, y: 12, w: 4, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'gameRecommendations', x: 0, y: 15, w: 4, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusEffectiveness', x: 0, y: 18, w: 4, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'playerRetention', x: 0, y: 21, w: 4, h: 3, static: false, isDraggable: true, isResizable: false }
  ];

  // For extra extra small screens (2 columns)
  const xxsLayoutBase = [
    { i: 'playerStats', x: 0, y: 0, w: 2, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'gameStats', x: 0, y: 2, w: 2, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'topGames', x: 0, y: 4, w: 2, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusStats', x: 0, y: 7, w: 2, h: 2, static: false, isDraggable: true, isResizable: false },
    { i: 'recentActivity', x: 0, y: 9, w: 2, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'playerSegments', x: 0, y: 12, w: 2, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'gameRecommendations', x: 0, y: 15, w: 2, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'bonusEffectiveness', x: 0, y: 18, w: 2, h: 3, static: false, isDraggable: true, isResizable: false },
    { i: 'playerRetention', x: 0, y: 21, w: 2, h: 3, static: false, isDraggable: true, isResizable: false }
  ];

  // Filter layouts to only include active widgets
  return {
    lg: createLayoutForActiveWidgets(lgLayoutBase),
    md: createLayoutForActiveWidgets(mdLayoutBase),
    sm: createLayoutForActiveWidgets(smLayoutBase),
    xs: createLayoutForActiveWidgets(xsLayoutBase),
    xxs: createLayoutForActiveWidgets(xxsLayoutBase)
  };
};

// Grid configuration for different screen sizes
export const gridCols = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

// Breakpoints for responsive layout
export const breakpoints = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};
