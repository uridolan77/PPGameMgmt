import { lazy, Suspense, ReactNode } from 'react';
import { AppRouteObject } from './types';
import { AuthGuard, RoleGuard } from './guards';
import { MainLayout, AuthLayout } from '../layouts';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

// Lazy-loaded components
const Dashboard = lazy(() => import('../../features/dashboard/pages/Dashboard'));
const GamesList = lazy(() => import('../../features/games/pages/GamesList'));
const GameDetail = lazy(() => import('../../features/games/pages/GameDetail'));
const PlayersList = lazy(() => import('../../features/players/pages/PlayersList'));
const PlayerDetail = lazy(() => import('../../features/players/pages/PlayerDetail'));
const BonusesList = lazy(() => import('../../features/bonuses/pages/BonusesList'));
const BonusDetail = lazy(() => import('../../features/bonuses/pages/BonusDetail'));
const Recommendations = lazy(() => import('../../features/recommendations/pages/Recommendations'));
const Login = lazy(() => import('../../features/auth/pages/Login'));
const NotFound = lazy(() => import('../../shared/components/NotFound'));
const Unauthorized = lazy(() => import('../../shared/components/Unauthorized'));

// Wraps component in suspense boundary for lazy loading
const suspensedRoute = (Component: React.LazyExoticComponent<any>): ReactNode => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
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
            {suspensedRoute(Dashboard)}
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
                {suspensedRoute(GamesList)}
              </AuthGuard>
            )
          },
          {
            path: ':id',
            element: (
              <AuthGuard>
                {suspensedRoute(GameDetail)}
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
                {suspensedRoute(PlayersList)}
              </AuthGuard>
            )
          },
          {
            path: ':id',
            element: (
              <AuthGuard>
                {suspensedRoute(PlayerDetail)}
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