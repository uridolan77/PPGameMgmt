import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AVAILABLE_WIDGETS = {
  playerStats: {
    id: 'playerStats',
    title: 'Player Statistics',
    description: 'Shows key player metrics and trends',
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 0, y: 0 }
  },
  gameStats: {
    id: 'gameStats',
    title: 'Game Statistics',
    description: 'Shows game activity and popularity metrics',
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 6, y: 0 }
  },
  topGames: {
    id: 'topGames',
    title: 'Top Games',
    description: 'Displays most popular games by plays and revenue',
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 0, y: 2 }
  },
  bonusStats: {
    id: 'bonusStats',
    title: 'Bonus Performance',
    description: 'Shows bonus claim rates and engagement metrics',
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 6, y: 2 }
  },
  recentActivity: {
    id: 'recentActivity',
    title: 'Recent Activity',
    description: 'Shows recent player actions and events',
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 3, h: 3 },
    defaultPosition: { x: 0, y: 5 }
  },
  playerSegments: {
    id: 'playerSegments',
    title: 'Player Segments',
    description: 'Distribution of players across segments',
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 3, h: 3 },
    defaultPosition: { x: 6, y: 4 }
  },
  gameRecommendations: {
    id: 'gameRecommendations',
    title: 'Game Recommendations',
    description: 'Top recommended games for different player segments',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 0, y: 8 }
  },
  bonusEffectiveness: {
    id: 'bonusEffectiveness',
    title: 'Bonus Effectiveness',
    description: 'Measures ROI and effectiveness of different bonus types',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 4, y: 8 }
  },
  playerRetention: {
    id: 'playerRetention',
    title: 'Player Retention',
    description: 'Player retention statistics and trends',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    defaultPosition: { x: 8, y: 8 }
  }
};

// Default layout based on a 12-column grid
const DEFAULT_LAYOUT = [
  { i: 'playerStats', x: 0, y: 0, w: 6, h: 2 },
  { i: 'gameStats', x: 6, y: 0, w: 6, h: 2 },
  { i: 'topGames', x: 0, y: 2, w: 6, h: 3 },
  { i: 'bonusStats', x: 6, y: 2, w: 6, h: 2 },
  { i: 'recentActivity', x: 0, y: 5, w: 6, h: 3 },
  { i: 'playerSegments', x: 6, y: 4, w: 6, h: 3 }
];

// Create dashboard store
const useDashboardStore = create(
  persist(
    (set, get) => ({
      // All available widgets metadata
      availableWidgets: AVAILABLE_WIDGETS,

      // Active widgets in dashboard (their IDs)
      activeWidgets: [
        'playerStats',
        'gameStats',
        'topGames',
        'bonusStats',
        'recentActivity',
        'playerSegments'
      ],

      // Current layout of widgets
      layout: DEFAULT_LAYOUT,

      // Widget-specific settings
      widgetSettings: {
        playerStats: {
          showNewPlayers: true,
          showActivePlayersChart: true,
          timeframe: 'week'
        },
        gameStats: {
          showTopGames: true,
          showRevenueChart: true,
          timeframe: 'month'
        },
        topGames: {
          limit: 5,
          sortBy: 'plays',
          timeframe: 'week'
        },
        bonusStats: {
          showActiveOnly: true,
          groupBy: 'type'
        },
        recentActivity: {
          limit: 10,
          types: ['login', 'game-play', 'bonus-claim']
        },
        playerSegments: {
          chartType: 'pie'
        },
        gameRecommendations: {
          playerSegment: 'all',
          limit: 5
        },
        bonusEffectiveness: {
          timeframe: 'month',
          sortBy: 'roi'
        },
        playerRetention: {
          timeframe: 'month',
          cohortSize: 'week'
        }
      },

      // Add a widget to the dashboard
      addWidget: (widgetId) => {
        if (!AVAILABLE_WIDGETS[widgetId]) return;

        const widget = AVAILABLE_WIDGETS[widgetId];

        set((state) => {
          // If widget is already active, don't add it again
          if (state.activeWidgets.includes(widgetId)) return state;

          // Find the best position for the new widget
          // Calculate the maximum y-coordinate plus height in the current layout
          let maxY = 0;
          state.layout.forEach(item => {
            const itemBottom = item.y + item.h;
            if (itemBottom > maxY) {
              maxY = itemBottom;
            }
          });

          // Position the new widget at the bottom of the layout
          // Try to place it in the first column if possible
          const newWidgetPosition = {
            i: widgetId,
            x: 0,
            y: maxY + 1, // Add some spacing
            w: widget.defaultSize.w,
            h: widget.defaultSize.h
          };

          // Add widget to layout with calculated position
          const newLayout = [
            ...state.layout,
            newWidgetPosition
          ];

          return {
            activeWidgets: [...state.activeWidgets, widgetId],
            layout: newLayout
          };
        });
      },

      // Remove a widget from the dashboard
      removeWidget: (widgetId) => set((state) => ({
        activeWidgets: state.activeWidgets.filter(id => id !== widgetId),
        layout: state.layout.filter(item => item.i !== widgetId)
      })),

      // Update layout after user drag/resize
      updateLayout: (newLayout) => set({ layout: newLayout }),

      // Update settings for a specific widget
      updateWidgetSettings: (widgetId, settings) => set((state) => ({
        widgetSettings: {
          ...state.widgetSettings,
          [widgetId]: {
            ...state.widgetSettings[widgetId],
            ...settings
          }
        }
      })),

      // Reset dashboard to default configuration
      resetDashboard: () => set({
        activeWidgets: [
          'playerStats',
          'gameStats',
          'topGames',
          'bonusStats',
          'recentActivity',
          'playerSegments'
        ],
        layout: DEFAULT_LAYOUT,
        widgetSettings: {
          playerStats: {
            showNewPlayers: true,
            showActivePlayersChart: true,
            timeframe: 'week'
          },
          gameStats: {
            showTopGames: true,
            showRevenueChart: true,
            timeframe: 'month'
          },
          topGames: {
            limit: 5,
            sortBy: 'plays',
            timeframe: 'week'
          },
          bonusStats: {
            showActiveOnly: true,
            groupBy: 'type'
          },
          recentActivity: {
            limit: 10,
            types: ['login', 'game-play', 'bonus-claim']
          },
          playerSegments: {
            chartType: 'pie'
          },
          gameRecommendations: {
            playerSegment: 'all',
            limit: 5
          },
          bonusEffectiveness: {
            timeframe: 'month',
            sortBy: 'roi'
          },
          playerRetention: {
            timeframe: 'month',
            cohortSize: 'week'
          }
        }
      })
    }),
    {
      name: 'dashboard-configuration',
      version: 1
    }
  )
);

export default useDashboardStore;