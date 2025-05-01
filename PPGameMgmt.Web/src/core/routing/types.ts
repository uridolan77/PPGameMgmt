import { ReactNode } from 'react';

export interface AppRouteObject {
  path?: string;
  element?: React.ReactNode;
  children?: AppRouteObject[];
  index?: boolean;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  layout?: React.ComponentType<{ children: ReactNode }>;
}