import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
import Home from './components/Home';
import Players from './components/Players';
import PlayerDetail from './components/PlayerDetail';
import Games from './components/Games';
import GameDetail from './components/GameDetail';
import GameForm from './components/GameForm';
import Bonuses from './components/Bonuses';
import BonusDetail from './components/BonusDetail';
import BonusForm from './components/BonusForm';
import Recommendations from './components/Recommendations';
import ApiTester from './components/ApiTester';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              
              <Route path="players">
                <Route index element={<Players />} />
                <Route path=":id" element={<PlayerDetail />} />
              </Route>
              
              <Route path="games">
                <Route index element={<Games />} />
                <Route path=":id" element={<GameDetail />} />
                <Route path="new" element={<GameForm />} />
                <Route path="edit/:id" element={<GameForm />} />
              </Route>
              
              <Route path="bonuses">
                <Route index element={<Bonuses />} />
                <Route path=":id" element={<BonusDetail />} />
                <Route path="new" element={<BonusForm />} />
                <Route path="edit/:id" element={<BonusForm />} />
              </Route>
              
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="api-tester" element={<ApiTester />} />
              <Route path="*" element={<div>Page Not Found</div>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
