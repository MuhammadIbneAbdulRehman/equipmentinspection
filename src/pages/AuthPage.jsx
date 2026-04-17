import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login, register, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password, licenseNumber: formData.licenseNumber });
        addToast('Successfully signed in!', 'success');
      } else {
        await register(formData);
        addToast('Account created successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex items-center justify-center p-6" style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top left, #fcfbf8 0%, #faf8f2 40%, #ffffff 100%)'
    }}>
      <div className="glass-card w-full animate-fade-in" style={{ maxWidth: 460, padding: 48 }}>
        <div className="flex flex-col items-center mb-10">
          <div style={{ 
            width: 120, 
            height: 120, 
            marginBottom: 24,
            filter: 'drop-shadow(0 12px 24px rgba(193, 164, 100, 0.5))'
          }}>
            <img src="/src/assets/logo.png" alt="PASS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center' }}>PASS INSPECTION</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
            Prime Assessment Services and Solutions
          </p>
        </div>

        <div className="flex mb-10 bg-slate-100/50 rounded-2xl p-1.5" style={{ background: '#f1f5f9' }}>
          <button 
            className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            onClick={() => setIsLogin(true)}
            style={{ 
              background: isLogin ? 'white' : 'transparent',
              color: isLogin ? 'var(--accent-color)' : 'var(--text-secondary)',
              boxShadow: isLogin ? 'var(--shadow-md)' : 'none',
              fontWeight: isLogin ? 700 : 500
            }}
          >
            <LogIn size={18} /> Sign In
          </button>
          <button 
            className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            onClick={() => setIsLogin(false)}
            style={{ 
              background: !isLogin ? 'white' : 'transparent',
              color: !isLogin ? 'var(--accent-color)' : 'var(--text-secondary)',
              boxShadow: !isLogin ? 'var(--shadow-md)' : 'none',
              fontWeight: !isLogin ? 700 : 500
            }}
          >
            <UserPlus size={18} /> Join Us
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Inspector Name"
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  style={{ paddingLeft: 48 }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email" 
                placeholder="email@example.com"
                value={formData.email} 
                onChange={handleChange} 
                required 
                style={{ paddingLeft: 48 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  style={{ paddingLeft: 48 }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label>License Number</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="licenseNumber" 
                  placeholder="INSP-00000"
                  value={formData.licenseNumber} 
                  onChange={handleChange} 
                  required 
                  style={{ paddingLeft: 48 }}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-6"
            disabled={loading}
            style={{ height: 52 }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In to PASS' : 'Create Inspector Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
