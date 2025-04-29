/**
 * Dashboard layout configuration
 * This file contains the layout configurations for different screen sizes
 */

// Define default positions for known widgets
// Using a 12-column grid with 3-column widgets for a 4-column layout
const defaultPositions = {
  playerStats: { x: 0, y: 0, w: 3, h: 2 },
  gameStats: { x: 3, y: 0, w: 3, h: 2 },
  topGames: { x: 6, y: 0, w: 3, h: 3 },
  bonusStats: { x: 9, y: 0, w: 3, h: 2 },
  recentActivity: { x: 0, y: 2, w: 3, h: 3 },
  playerSegments: { x: 3, y: 2, w: 3, h: 3 },
  gameRecommendations: { x: 6, y: 3, w: 3, h: 3 },
  bonusEffectiveness: { x: 9, y: 2, w: 3, h: 3 },
  playerRetention: { x: 0, y: 5, w: 12, h: 3 }
};

// Create layout configurations for the dashboard
export const createLayouts = (activeWidgets) => {
  // Create layouts for large screens (lg)
  const lgLayout = activeWidgets.map((widgetId) => {
    const defaultPos = defaultPositions[widgetId] || { x: 0, y: 0, w: 6, h: 2 };
    return {
      i: widgetId,
      x: defaultPos.x,
      y: defaultPos.y,
      w: defaultPos.w,
      h: defaultPos.h,
      minW: 3,
      maxW: 12,
      static: false,
      isDraggable: true,
      isResizable: false
    };
  });

  // Create layouts for medium screens (md)
  const mdLayout = activeWidgets.map((widgetId, index) => {
    const defaultPos = defaultPositions[widgetId] || { x: 0, y: 0, w: 4, h: 2 };
    return {
      i: widgetId,
      x: index % 3 * 4, // Create a 3-column layout (0, 4, 8)
      y: Math.floor(index / 3) * 3, // New row every 3 widgets
      w: 4, // Each widget takes 4 columns (out of 12)
      h: defaultPos.h,
      minW: 3,
      maxW: 12,
      static: false,
      isDraggable: true,
      isResizable: false
    };
  });

  // Create layouts for small screens (sm)
  const smLayout = activeWidgets.map((widgetId, index) => {
    const defaultPos = defaultPositions[widgetId] || { x: 0, y: 0, w: 6, h: 2 };
    return {
      i: widgetId,
      x: index % 2 * 6, // Create a 2-column layout (0, 6)
      y: Math.floor(index / 2) * 3, // New row every 2 widgets
      w: 6, // Each widget takes 6 columns (out of 12)
      h: defaultPos.h,
      static: false,
      isDraggable: true,
      isResizable: false
    };
  });

  // Create layouts for extra small screens (xs)
  const xsLayout = activeWidgets.map((widgetId, index) => {
    const defaultPos = defaultPositions[widgetId] || { x: 0, y: 0, w: 4, h: 2 };
    return {
      i: widgetId,
      x: 0,
      y: index * 3, // Stack vertically
      w: 4,
      h: defaultPos.h,
      static: false,
      isDraggable: true,
      isResizable: false
    };
  });

  // Create layouts for extra extra small screens (xxs)
  const xxsLayout = activeWidgets.map((widgetId, index) => {
    const defaultPos = defaultPositions[widgetId] || { x: 0, y: 0, w: 2, h: 2 };
    return {
      i: widgetId,
      x: 0,
      y: index * 3, // Stack vertically
      w: 2,
      h: defaultPos.h,
      static: false,
      isDraggable: true,
      isResizable: false
    };
  });

  return {
    lg: lgLayout,
    md: mdLayout,
    sm: smLayout,
    xs: xsLayout,
    xxs: xxsLayout
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
