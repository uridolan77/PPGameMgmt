import { lazy, Suspense, ReactNode, useEffect } from 'react';
import { AppRouteObject } from './types';
import { AuthGuard, RoleGuard } from './guards';
import { MainLayout, AuthLayout } from '../layouts';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { registerPreloadable } from './preloadRoutes';

// Improved lazy loading with registration for preloading
const createLazyComponent = <T extends React.ComponentType<any>>(
  name: string,
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  // Register for potential preloading
  registerPreloadable(name, importFn);
  return lazy(importFn);
};

// Lazy-loaded features with registration for preloading
const DashboardPage = createLazyComponent('dashboard',
  () => import('../../features/dashboard').then(module => ({ default: module.DashboardPage }))
);
const GamesListPage = createLazyComponent('games-list',
  () => import('../../features/games').then(module => ({ default: module.GamesListPage }))
);
const GameDetailPage = createLazyComponent('game-detail',
  () => import('../../features/games').then(module => ({ default: module.GameDetailPage }))
);
const GameFormPage = createLazyComponent('game-form',
  () => import('../../features/games').then(module => ({ default: module.GameFormPage }))
);
const PlayersListPage = createLazyComponent('players-list',
  () => import('../../features/players').then(module => ({ default: module.PlayersListPage }))
);
const PlayerDetailPage = createLazyComponent('player-detail',
  () => import('../../features/players').then(module => ({ default: module.PlayerDetailPage }))
);
const PlayerFormPage = createLazyComponent('player-form',
  () => import('../../features/players').then(module => ({ default: module.PlayerFormPage }))
);
const BonusesList = createLazyComponent('bonuses-list',
  () => import('../../features/bonuses/pages/BonusesList')
);
const BonusDetail = createLazyComponent('bonus-detail',
  () => import('../../features/bonuses/pages/BonusDetail')
);
const Recommendations = createLazyComponent('recommendations',
  () => import('../../features/recommendations/pages/Recommendations')
);
const Login = createLazyComponent('login',
  () => import('../../features/auth/pages/MuiLogin')
);
const TestLogin = createLazyComponent('test-login',
  () => import('../../features/auth/pages/TestLogin')
);
const SimpleLogin = createLazyComponent('simple-login',
  () => import('../../features/auth/pages/SimpleLogin')
);
const NotFound = createLazyComponent('not-found',
  () => import('../../shared/components/NotFound')
);
const Unauthorized = createLazyComponent('unauthorized',
  () => import('../../shared/components/Unauthorized')
);

// Enhanced suspense with performance tracking in development
const SuspenseBoundary = ({ children }: { children: ReactNode }) => {
  // Performance tracking in development environment
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();

      return () => {
        const loadTime = performance.now() - startTime;
        if (loadTime > 500) {  // 500ms threshold
          console.warn(`Slow component load: ${loadTime.toFixed(1)}ms. Consider optimizing.`);
        }
      };
    }
  }, []);

  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
};

// Wraps component in suspense boundary for lazy loading
const suspensedRoute = (Component: React.LazyExoticComponent<any>): ReactNode => (
  <SuspenseBoundary>
    <Component />
  </SuspenseBoundary>
);

export const routes: AppRouteObject[] = [
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: suspensedRoute(Login)
      }
    ]
  },
  {
    path: '/test-login',
    element: suspensedRoute(TestLogin)
  },
  {
    path: '/simple-login',
    element: suspensedRoute(SimpleLogin)
  },
  {
    path: '/unauthorized',
    element: suspensedRoute(Unauthorized)
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            {suspensedRoute(DashboardPage)}
          </AuthGuard>
        )
      },
      {
        path: 'games',
        children: [
          {
            index: true,
            element: (
              <AuthGuard>
                {suspensedRoute(GamesListPage)}
              </AuthGuard>
            )
          },
          {
            path: 'new',
            element: (
              <AuthGuard>
                {suspensedRoute(GameFormPage)}
              </AuthGuard>
            )
          },
          {
            path: ':id',
            element: (
              <AuthGuard>
                {suspensedRoute(GameDetailPage)}
              </AuthGuard>
            )
          },
          {
            path: ':id/edit',
            element: (
              <AuthGuard>
                {suspensedRoute(GameFormPage)}
              </AuthGuard>
            )
          }
        ]
      },
      {
        path: 'players',
        children: [
          {
            index: true,
            element: (
              <AuthGuard>
                {suspensedRoute(PlayersListPage)}
              </AuthGuard>
            )
          },
          {
            path: 'new',
            element: (
              <AuthGuard>
                {suspensedRoute(PlayerFormPage)}
              </AuthGuard>
            )
          },
          {
            path: ':id',
            element: (
              <AuthGuard>
                {suspensedRoute(PlayerDetailPage)}
              </AuthGuard>
            )
          },
          {
            path: ':id/edit',
            element: (
              <AuthGuard>
                {suspensedRoute(PlayerFormPage)}
              </AuthGuard>
            )
          }
        ]
      },
      {
        path: 'bonuses',
        children: [
          {
            index: true,
            element: (
              <AuthGuard>
                {suspensedRoute(BonusesList)}
              </AuthGuard>
            )
          },
          {
            path: ':id',
            element: (
              <AuthGuard>
                {suspensedRoute(BonusDetail)}
              </AuthGuard>
            )
          }
        ]
      },
      {
        path: 'recommendations',
        element: (
          <AuthGuard>
            <RoleGuard requiredRoles={['admin', 'marketer']}>
              {suspensedRoute(Recommendations)}
            </RoleGuard>
          </AuthGuard>
        )
      },
      {
        path: 'admin',
        element: (
          <AuthGuard>
            <RoleGuard requiredRoles={['admin']}>
              {/* Admin routes will go here */}
              <div>Admin Panel</div>
            </RoleGuard>
          </AuthGuard>
        )
      }
    ]
  },
  {
    path: '*',
    element: suspensedRoute(NotFound)
  }
];