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
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Link to="/">
            <h1>Players & Prizes</h1>
          </Link>
        </div>

        <div className="mobile-toggle" onClick={toggleMobileMenu}>
          <span className="menu-icon">☰</span>
        </div>

        <nav className={`main-nav ${showMobileMenu ? 'mobile-visible' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : ''}>
                Games
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/players" className={({ isActive }) => isActive ? 'active' : ''}>
                Players
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/bonuses" className={({ isActive }) => isActive ? 'active' : ''}>
                Bonuses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/recommendations" className={({ isActive }) => isActive ? 'active' : ''}>
                Recommendations
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="user-controls">
          {currentUser && (
            <>
              <span className="user-greeting">
                Hello, {currentUser.name || currentUser.username}
              </span>
              <div className="user-menu">
                <button className="user-menu-toggle">
                  {currentUser.initials || 'U'}
                </button>
                <ul className="user-menu-dropdown">
                  <li>
                    <button onClick={() => navigate('/profile')}>
                      My Profile
                    </button>
                  </li>
                  <li>
                    <button onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 Players & Prizes Game Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;