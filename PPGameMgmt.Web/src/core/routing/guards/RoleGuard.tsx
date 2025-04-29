import { Navigate } from 'react-router-dom';
import { useStore } from '../../store';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

export const RoleGuard = ({ children, requiredRoles }: RoleGuardProps) => {
  const { auth } = useStore();

  // If user is not logged in, this should never happen because AuthGuard should be used first
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => auth.user?.roles.includes(role));
  
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};