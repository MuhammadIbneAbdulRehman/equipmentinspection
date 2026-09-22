// src/components/Sidebar.jsx

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users2,
  ClipboardCheck,
  FileSearch,
  LogOut,
} from 'lucide-react';
import './styles/Sidebar.css';

const MENU = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users2 },
  { title: 'Inspections', path: '/inspections', icon: ClipboardCheck },
  { title: 'Reports', path: '/reports', icon: FileSearch },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="equip_Sidebar">
      <div className="equip_Sidebar__top">
        {/* Brand */}
        <div className="equip_Sidebar__brand">
          <div className="equip_Sidebar__brandLogoWrap">
            <img
              src="/src/assets/logo.png"
              alt="PASS Logo"
              className="equip_Sidebar__brandLogo"
            />
          </div>
          <div className="equip_Sidebar__brandText">
            <h1 className="equip_Sidebar__brandName">PASS</h1>
            <p className="equip_Sidebar__brandTag">Inspection System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="equip_Sidebar__nav">
          <span className="equip_Sidebar__navLabel">Menu</span>

          {MENU.map(({ title, path, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`equip_Sidebar__link ${isActive ? 'equip_Sidebar__link--active' : ''
                  }`}
              >
                <Icon size={20} className="equip_Sidebar__linkIcon" />
                <span className="equip_Sidebar__linkText">{title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="equip_Sidebar__bottom">
        <div className="equip_Sidebar__userCard">
          <div className="equip_Sidebar__userRow">
            <div className="equip_Sidebar__userAvatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="equip_Sidebar__userMeta">
              <p className="equip_Sidebar__userName">
                {user?.name || 'Inspector'}
              </p>
              <p className="equip_Sidebar__userRole">Field Inspector</p>
            </div>
          </div>
          {user?.licenseNumber && (
            <div className="equip_Sidebar__licenseBadge">
              {user.licenseNumber}
            </div>
          )}
        </div>

        <button onClick={logout} className="equip_Sidebar__logout">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;