// src/components/MobileTabBar.jsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  ClipboardCheck,
  FileSearch,
  Plus,
} from 'lucide-react';
import './styles/MobileTabBar.css';

const LEFT_ITEMS = [
  { title: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users2 },
];

const RIGHT_ITEMS = [
  { title: 'Reports', path: '/reports', icon: FileSearch },
  { title: 'My Ads', path: '/inspections', icon: ClipboardCheck },
];

const TabItem = ({ title, path, icon: Icon, active }) => (
  <Link
    to={path}
    className={`equip_MobileTabBar__item ${active ? 'equip_MobileTabBar__item--active' : ''
      }`}
    aria-label={title}
  >
    <span className="equip_MobileTabBar__iconWrap">
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
    </span>
    <span className="equip_MobileTabBar__label">{title}</span>
  </Link>
);

const MobileTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = p => location.pathname.startsWith(p);

  return (
    <nav className="equip_MobileTabBar" aria-label="Mobile navigation">
      {LEFT_ITEMS.map(item => (
        <TabItem key={item.path} {...item} active={isActive(item.path)} />
      ))}

      <button
        className="equip_MobileTabBar__fab"
        onClick={() => navigate('/inspections')}
        aria-label="New inspection"
      >
        <Plus size={26} strokeWidth={2.6} />
      </button>

      {RIGHT_ITEMS.map(item => (
        <TabItem key={item.path} {...item} active={isActive(item.path)} />
      ))}
    </nav>
  );
};

export default MobileTabBar;