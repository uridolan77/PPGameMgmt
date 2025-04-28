import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Alert, Snackbar } from "@mui/material";
import Dashboard from "./pages/Dashboard/Dashboard";
import GameLibrary from "./pages/GameLibrary";
import PlayerProfile from "./pages/PlayerProfile";
import BonusOffers from "./pages/BonusOffers";
import Recommendations from "./pages/Recommendations";
import Layout from "./components/common/Layout";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import RequireAuth from "./components/common/RequireAuth";
import { validateApiConnection } from "./utils/certUtils";

function App() {
  const [apiError, setApiError] = useState(false);
  
  // Check API connection on app startup
  useEffect(() => {
    const checkApiConnection = async () => {
      const isConnected = await validateApiConnection();
      if (!isConnected) {
        setApiError(true);
      }
    };
    
    checkApiConnection();
  }, []);
  
  // Use try-catch to handle potential context issues with StrictMode double rendering
  let authContext = { user: null };
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn("Auth context not available yet:", error.message);
    // Will retry on next render since StrictMode renders twice
  }
  
  const { user } = authContext;
  
  // Handle closing the API error alert
  const handleCloseApiError = () => {
    setApiError(false);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* API Connection Error Alert */}
      <Snackbar open={apiError} autoHideDuration={10000} onClose={handleCloseApiError}>
        <Alert 
          onClose={handleCloseApiError} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          Unable to connect to the API server. Please open {window.location.protocol}//localhost:7210 in a new tab, accept the certificate, then return here.
        </Alert>
      </Snackbar>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="games" element={<GameLibrary />} />
          <Route path="players/:playerId" element={<PlayerProfile />} />
          <Route path="bonuses" element={<BonusOffers />} />
          <Route path="recommendations" element={<Recommendations />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;