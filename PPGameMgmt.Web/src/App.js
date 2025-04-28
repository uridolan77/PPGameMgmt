import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Dashboard from "./pages/Dashboard";
import GameLibrary from "./pages/GameLibrary";
import PlayerProfile from "./pages/PlayerProfile";
import BonusOffers from "./pages/BonusOffers";
import Recommendations from "./pages/Recommendations";
import Layout from "./components/common/Layout";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import RequireAuth from "./components/common/RequireAuth";

function App() {
  // Use try-catch to handle potential context issues with StrictMode double rendering
  let authContext = { user: null };
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn("Auth context not available yet:", error.message);
    // Will retry on next render since StrictMode renders twice
  }
  
  const { user } = authContext;

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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