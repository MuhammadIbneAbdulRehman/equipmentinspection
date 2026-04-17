import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on desktop, reset on path change
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-color)' }}>
      <div className="loader" style={{
        width: 48,
        height: 48,
        border: '4px solid var(--card-border)',
        borderTopColor: 'var(--accent-color)',
        borderRadius: '50%',
        animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/" />;

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Desktop Navigation */}
      <Navbar />

      {/* Mobile Top Header */}
      <header className="mobile-header flex items-center justify-between px-10" style={{
        height: 'var(--mobile-header-height)',
        background: '#C1A464 ',
        borderBottom: '3px solid var(--accent-color)',
        position: 'sticky',
        padding: 30,
        top: 0,
        zIndex: 800,
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'transparent', color: 'white', padding: 8, marginLeft: -8 }}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div style={{ 
              width: 64, height: 64, 
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))'
            }}>
              <img src="/src/assets/logo.png" alt="PASS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Outfit', sans-serif", color: 'white' }}>PASS</span>
          </div>
        </div>
        <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>
          <Bell size={20} />
        </button>
      </header>

      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className="transition-all" style={{
        padding: 'var(--content-padding)',
        paddingTop: 'calc(var(--header-height) + 24px)',
        width: '100%',
        maxWidth: '1440px',
        margin: '20px auto',
        flex: 1
      }}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
        }
        @media (max-width: 768px) {
          main { padding-top: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
