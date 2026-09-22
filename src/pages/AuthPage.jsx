// src/pages/AuthPage.jsx

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import './styles/AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const { login, register, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Already signed in → dashboard
  if (user) return <Navigate to="/dashboard" />;

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
          licenseNumber: formData.licenseNumber,
        });
        addToast('Successfully signed in!', 'success');
      } else {
        await register(formData);
        addToast('Account created successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Authentication failed.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="equip_Auth">
      <div className="equip_Auth__card">
        {/* ─── Brand ─── */}
        <div className="equip_Auth__brand">
          <div className="equip_Auth__logoWrap">
            <img
              src="/src/assets/logo.png"
              alt="PASS Logo"
              className="equip_Auth__logo"
            />
          </div>
          <h1 className="equip_Auth__brandName">PASS INSPECTION</h1>
          <p className="equip_Auth__brandTag">
            Prime Assessment Services and Solutions
          </p>
        </div>

        {/* ─── Tabs ─── */}
        <div className="equip_Auth__tabs">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`equip_Auth__tab ${isLogin ? 'equip_Auth__tab--active' : ''
              }`}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`equip_Auth__tab ${!isLogin ? 'equip_Auth__tab--active' : ''
              }`}
          >
            <UserPlus size={16} /> Join Us
          </button>
        </div>

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="equip_Auth__form">
          {!isLogin && (
            <div className="equip_Auth__field">
              <label className="equip_Auth__label">Full Name</label>
              <div className="equip_Auth__inputWrap">
                <UserIcon size={18} className="equip_Auth__inputIcon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Inspector Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="equip_Auth__input"
                />
              </div>
            </div>
          )}

          <div className="equip_Auth__field">
            <label className="equip_Auth__label">Email Address</label>
            <div className="equip_Auth__inputWrap">
              <Mail size={18} className="equip_Auth__inputIcon" />
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="equip_Auth__input"
              />
            </div>
          </div>

          <div className="equip_Auth__field">
            <label className="equip_Auth__label">Password</label>
            <div className="equip_Auth__inputWrap">
              <Lock size={18} className="equip_Auth__inputIcon" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="equip_Auth__input"
              />
            </div>
          </div>

          <div className="equip_Auth__field">
            <label className="equip_Auth__label">License Number</label>
            <div className="equip_Auth__inputWrap">
              <ShieldCheck size={18} className="equip_Auth__inputIcon" />
              <input
                type="text"
                name="licenseNumber"
                placeholder="INSP-00000"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="equip_Auth__input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="equip_Auth__submit"
          >
            {loading
              ? 'Processing…'
              : isLogin
                ? 'Sign In to PASS'
                : 'Create Inspector Account'}
          </button>
        </form>

        {/* ─── Footer ─── */}
        <div className="equip_Auth__footer">
          © {new Date().getFullYear()} PASS — Prime Assessment Services and
          Solutions
        </div>
      </div>
    </div>
  );
};

export default AuthPage;







// credentials
// full name: "Ashfaq Hussain"
// email: "inspector@gmil.com"
// password: "ins123456"
// license number: "INS-0123456"