import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { auth } = useStore();
  const location = useLocation();

  if (!auth.user) {
    // Redirect to login page, but save the current location they were
    // trying to go to for a redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};