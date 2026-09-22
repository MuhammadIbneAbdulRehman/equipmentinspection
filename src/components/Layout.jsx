// src/components/Layout.jsx

import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './MobileTabBar';
import MobileTabBar from './MobileTabBar';
import { useAuth } from '../context/AuthContext';
import './styles/Layout.css';

const Layout = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="equip_Layout__loading">
        <div className="equip_Layout__spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  return (
    <div className="equip_Layout">
      {/* Desktop navbar */}
      <Navbar />

      {/* Mobile header — no hamburger, no bell */}
      <header className="equip_Layout__mobileHeader">
        <div className="equip_Layout__mobileLeft">
          <div className="equip_Layout__mobileLogoWrap">
            <img
              src="/src/assets/logo.png"
              alt="PASS"
              className="equip_Layout__mobileLogo"
            />
          </div>
          <span className="equip_Layout__mobileBrand">PASS</span>
        </div>

        <div className="equip_Layout__mobileRight">
          <button
            className="equip_Layout__mobileUserBtn"
            onClick={() => setUserMenuOpen(o => !o)}
            aria-label="User menu"
          >
            <div className="equip_Layout__mobileAvatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>

          {userMenuOpen && (
            <div className="equip_Layout__mobileDropdown">
              <div className="equip_Layout__mobileDropdownHeader">
                <p className="equip_Layout__mobileDropdownName">
                  {user?.name || 'Inspector'}
                </p>
                <p className="equip_Layout__mobileDropdownEmail">
                  {user?.email || '—'}
                </p>
              </div>
              <button
                className="equip_Layout__mobileDropdownItem"
                onClick={logout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="equip_Layout__main">
        <div className="equip_Layout__content">{children}</div>
      </main>

      {/* Bottom tab bar — phone only */}
      <MobileTabBar />
    </div>
  );
};

export default Layout;