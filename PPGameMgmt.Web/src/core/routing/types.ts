import { ReactNode } from 'react';
import { RouteObject } from 'react-router-dom';

export interface AppRouteObject extends RouteObject {
  requiresAuth?: boolean;
  requiredRoles?: string[];
  layout?: React.ComponentType<{ children: ReactNode }>;
}