import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../../features/auth/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const auth = useAuth();
  const location = useLocation();

  // For debugging
  console.log('AuthGuard - Current user:', auth.user);
  console.log('AuthGuard - Current location:', location);

  if (!auth.user) {
    console.log('AuthGuard - Redirecting to login');
    // Redirect to login page, but save the current location they were
    // trying to go to for a redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('AuthGuard - User authenticated, rendering children');
  return <>{children}</>;
};