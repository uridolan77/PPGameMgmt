import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // If auth is still loading, show nothing or a loading spinner
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && (!currentUser.roles || !currentUser.roles.includes(requiredRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated (and has required role if specified)
  return <Outlet />;
};

export default ProtectedRoute;