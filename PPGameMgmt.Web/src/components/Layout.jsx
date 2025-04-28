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

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>PP Game Management</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : ''}>
                Games
              </NavLink>
            </li>
            <li>
              <NavLink to="/players" className={({ isActive }) => isActive ? 'active' : ''}>
                Players
              </NavLink>
            </li>
            <li>
              <NavLink to="/bonuses" className={({ isActive }) => isActive ? 'active' : ''}>
                Bonuses
              </NavLink>
            </li>
            <li>
              <NavLink to="/recommendations" className={({ isActive }) => isActive ? 'active' : ''}>
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