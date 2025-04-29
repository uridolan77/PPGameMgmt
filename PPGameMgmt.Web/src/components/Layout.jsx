import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  // SVG icons for navigation
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
      </svg>
    ),
    games: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    ),
    players: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    bonuses: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
        <polyline points="20 12 20 22 4 22 4 12"></polyline>
        <rect x="2" y="7" width="20" height="5"></rect>
        <line x1="12" y1="22" x2="12" y2="7"></line>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
      </svg>
    ),
    recommendations: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
  };

  // Check if dark mode is enabled
  const isDarkMode = localStorage.getItem('preferred-theme') === 'dark';

  return (
    <div className={`layout ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>PP Game Management</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                {icons.dashboard}
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : ''}>
                {icons.games}
                Games
              </NavLink>
            </li>
            <li>
              <NavLink to="/players" className={({ isActive }) => isActive ? 'active' : ''}>
                {icons.players}
                Players
              </NavLink>
            </li>
            <li>
              <NavLink to="/bonuses" className={({ isActive }) => isActive ? 'active' : ''}>
                {icons.bonuses}
                Bonuses
              </NavLink>
            </li>
            <li>
              <NavLink to="/recommendations" className={({ isActive }) => isActive ? 'active' : ''}>
                {icons.recommendations}
                Recommendations
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          &copy; 2025 PP Game Management
        </div>
      </div>

      <div className="main-content">
        <div className="top-header">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>

          <div className="user-menu">
            {currentUser && (
              <>
                <span className="user-name">
                  {currentUser.name || currentUser.username}
                </span>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            {!currentUser && (
              <button className="login-button" onClick={() => navigate('/login')}>
                Login
              </button>
            )}
          </div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;