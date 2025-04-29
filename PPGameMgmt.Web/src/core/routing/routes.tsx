import { lazy, Suspense, ReactNode } from 'react';
import { AppRouteObject } from './types';
import { AuthGuard, RoleGuard } from './guards';
import { MainLayout, AuthLayout } from '../layouts';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

// Lazy-loaded features using the new module exports
const DashboardPage = lazy(() => import('../../features/dashboard').then(module => ({ default: module.DashboardPage })));
const GamesListPage = lazy(() => import('../../features/games').then(module => ({ default: module.GamesListPage })));
const GameDetailPage = lazy(() => import('../../features/games').then(module => ({ default: module.GameDetailPage })));
const GameFormPage = lazy(() => import('../../features/games').then(module => ({ default: module.GameFormPage })));
const PlayersListPage = lazy(() => import('../../features/players').then(module => ({ default: module.PlayersListPage })));
const PlayerDetailPage = lazy(() => import('../../features/players').then(module => ({ default: module.PlayerDetailPage })));
const PlayerFormPage = lazy(() => import('../../features/players').then(module => ({ default: module.PlayerFormPage })));
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