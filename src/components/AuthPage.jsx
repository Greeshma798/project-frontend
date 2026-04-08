import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { useEffect } from 'react';
export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState('USER'); // 'USER' or 'ADMIN'
  const [formData, setFormData] = useState({ email: '', password: '', adminCode: '' });
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    generateCaptcha();
  }, [isLogin, loginRole]);

  const generateCaptcha = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha({ 
      question: result, 
      answer: result 
    });
    setUserAnswer('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin && userAnswer !== captcha.answer) {
      setError('Incorrect captcha. Please try again.');
      generateCaptcha();
      return;
    }

    try {
      if (isLogin) {
        const res = await loginUser(formData);
        const userData = res.data;
        
        // Verify role match if intended
        if (loginRole === 'ADMIN' && userData.role !== 'ADMIN') {
          setError('This account does not have administrator privileges.');
          return;
        }

        onLogin(userData);
        navigate(userData.role === 'ADMIN' ? '/admin' : '/');
      } else {
        if (!formData.email.endsWith('@gmail.com')) {
          setError('Only @gmail.com emails are accepted.');
          return;
        }

        const role = formData.adminCode === 'admin123' ? 'ADMIN' : 'USER';
        
        const res = await registerUser({ 
          email: formData.email, 
          password: formData.password, 
          username: formData.email.split('@')[0],
          role: role 
        });
        onLogin(res.data);
        navigate(role === 'ADMIN' ? '/admin' : '/');
      }
    } catch (err) {
      console.error("Auth Error:", err);
      if (err.response && err.response.data) {
        const backendMessage = typeof err.response.data === 'string'
          ? err.response.data
          : (err.response.data.message || 'Authentication failed');
        setError(backendMessage);
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    }
  };

  return (
    <div className="auth-container glass-panel" style={{ maxWidth: '420px', margin: '4rem auto', padding: '3rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem' }}>
          {isLogin ? 'NutriTrack Login' : 'Register'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your health journey today.'}
        </p>
      </div>

      {isLogin && (
        <div className="role-switcher" style={{ display: 'flex', background: 'var(--secondary-color)', padding: '0.4rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setLoginRole('USER')} 
            style={loginRole === 'USER' ? activeRoleTab : roleTab}
          >
            User Login
          </button>
          <button 
            type="button"
            onClick={() => setLoginRole('ADMIN')} 
            style={loginRole === 'ADMIN' ? activeRoleTab : roleTab}
          >
            Admin Portal
          </button>
        </div>
      )}

      {error && <div style={{ 
        color: 'var(--danger-color)', 
        background: 'rgba(239, 68, 68, 0.1)', 
        padding: '1rem', 
        borderRadius: '0.75rem', 
        marginBottom: '1.5rem', 
        textAlign: 'center',
        fontSize: '0.9rem',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@gmail.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        {isLogin && (
          <div className="form-group">
            <label>Human Verification (Captcha)</label>
            <div style={{ 
              background: 'var(--bg-color)', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              letterSpacing: '8px',
              fontFamily: 'monospace',
              marginBottom: '0.75rem',
              userSelect: 'none',
              color: 'var(--primary-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {captcha.question}
            </div>
            <input 
              type="text" 
              placeholder="Enter characters exactly as shown" 
              value={userAnswer} 
              onChange={(e) => setUserAnswer(e.target.value)} 
              required 
            />
          </div>
        )}

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="adminCode">Admin Access Code (Optional)</label>
            <input
              type="text"
              id="adminCode"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              placeholder="Enter code for Admin privileges"
              style={{ border: formData.adminCode === 'admin123' ? '2px solid var(--success-color)' : '1px solid var(--border-color)' }}
            />
            {formData.adminCode === 'admin123' && <small style={{ color: 'var(--success-color)', fontWeight: '600' }}>✓ Valid Admin Code</small>}
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ height: '3.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
          {isLogin ? `Access ${loginRole === 'ADMIN' ? 'Console' : 'Dashboard'}` : `Register as ${formData.adminCode === 'admin123' ? 'Admin' : 'User'}`}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? "Need a personal account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setLoginRole('USER');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline',
              padding: 0,
              width: 'auto',
              marginLeft: '0.25rem'
            }}
          >
            {isLogin ? 'Sign up' : 'Log in here'}
          </button>
        </p>
      </div>
    </div>
  );
}

const roleTab = {
  flex: 1,
  padding: '0.6rem',
  borderRadius: '0.75rem',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all 0.3s ease'
};

const activeRoleTab = {
  ...roleTab,
  background: 'var(--bg-color)',
  color: 'var(--primary-color)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};
