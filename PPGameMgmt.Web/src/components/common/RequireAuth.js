import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login page, but save the location they were
  // trying to go to so we can send them there after they login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are authenticated, show the protected component
  return children;
};

export default RequireAuth;