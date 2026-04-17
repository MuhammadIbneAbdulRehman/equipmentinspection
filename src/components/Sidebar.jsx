import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users2, 
  ClipboardCheck, 
  FileSearch, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Clients', path: '/clients', icon: Users2 },
    { title: 'Inspections', path: '/inspections', icon: ClipboardCheck },
    { title: 'Reports', path: '/reports', icon: FileSearch },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1001
          }}
        ></div>
      )}

      <aside 
        className={`sidebar flex flex-col justify-between transition-all`}
        style={{ 
          width: '280px', 
          height: '100vh', 
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'white',
          borderRight: '1px solid var(--card-border)',
          padding: '40px 24px',
          zIndex: 1002,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s'
        }}
      >
        <div style={{ position: 'absolute', right: 16, top: 16 }}>
          <button onClick={onToggle} style={{ color: 'var(--text-muted)', background: 'transparent', padding: 8 }}>
            <X size={24} />
          </button>
        </div>

        <div>
          <div className="logo mb-18 px-2 flex items-center gap-6">
            <div style={{ 
              width: 80, 
              height: 80, 
              filter: 'drop-shadow(0 6px 12px rgba(193, 164, 100, 0.35))'
            }}>
              <img src="/src/assets/logo.png" alt="PASS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>PASS</h1>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginTop: 2 }}>INSPECTION SYSTEM</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="flex items-center justify-between"
                  style={{ textDecoration: 'none' }}
                  onClick={onToggle}
                >
                  <div 
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 600,
                    }}
                  >
                    <Icon size={20} style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-6">
          <div className="px-4 py-5 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-color)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {user?.name?.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>Field Inspector</p>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--accent-color)', fontWeight: 800, background: 'white', padding: '4px 10px', borderRadius: 8, display: 'inline-block', border: '1px solid var(--accent-soft)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {user?.licenseNumber}
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-danger hover:bg-danger-soft transition-all w-full"
            style={{ background: 'transparent' }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1 }}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
