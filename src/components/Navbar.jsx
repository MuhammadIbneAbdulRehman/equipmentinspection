import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users2, 
  ClipboardCheck, 
  FileSearch, 
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Clients', path: '/clients', icon: Users2 },
    { title: 'Inspections', path: '/inspections', icon: ClipboardCheck },
    { title: 'Reports', path: '/reports', icon: FileSearch },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="desktop-nav items-center justify-between px-[5%] fixed top-0 left-0 right-0 z-[1000]" style={{ 
      height: 'var(--header-height)', 
      background: '#1e3a8a', 
      borderBottom: '3px solid var(--accent-color)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
        }
      `}</style>
      <div className="flex items-center gap-12">
        <Link to="/dashboard" className="flex items-center gap-3" style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ 
            width: 72, 
            height: 72, 
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}>
            <img src="/src/assets/logo.png" alt="PASS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>PASS</span>
        </Link>

        <div className="flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 hover:bg-white/10"
                style={{ 
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.8)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  background: isActive ? 'rgba(193, 164, 100, 0.15)' : 'transparent'
                }}
              >
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div style={{ 
            width: 32, height: 32, borderRadius: '50%', 
            background: 'var(--accent-color)', color: 'white', 
            display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 
          }}>
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{user?.name}</span>
            <span style={{ fontSize: 10, color: 'var(--accent-color)', fontWeight: 800, letterSpacing: '0.02em' }}>{user?.licenseNumber}</span>
          </div>
          <ChevronDown size={14} color="rgba(255,255,255,0.6)" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </div>

        {isProfileOpen && (
          <div className="absolute right-10 top-[72px] w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-fade-in animate-slide-up">
            <div className="px-4 py-3 border-b border-slate-50 mb-1">
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field Operator</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{user?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger-soft transition-all"
              style={{ background: 'transparent' }}
            >
              <LogOut size={18} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
