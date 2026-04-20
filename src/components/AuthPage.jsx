import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getCaptcha } from '../services/api';
import { useEffect } from 'react';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', adminCode: '' });
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState({ id: '', text: '' });
  const [userAnswer, setUserAnswer] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadCaptcha();
  }, [isLogin]);

  const loadCaptcha = async () => {
    setCaptcha({ id: '', text: 'Loading...' });
    try {
      const res = await getCaptcha();
      if (res.data && res.data.captchaText) {
        setCaptcha({
          id: res.data.captchaId,
          text: res.data.captchaText
        });
      } else {
        setError('Unexpected captcha response from server.');
      }
      setUserAnswer('');
    } catch (err) {
      console.error("Captcha fetch error:", err);
      setError('Connection Error: Network Error');
      setCaptcha({ id: '', text: 'ERROR' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Send captcha details along with login
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
          captchaId: captcha.id,
          captchaAnswer: userAnswer
        });
        const userData = res.data;
        
        onLogin(userData);
        if (userData.role === 'ADMIN') navigate('/admin');
        else if (userData.role === 'NUTRITIONIST') navigate('/nutritionist');
        else navigate('/');
      } else {
        if (!formData.email.endsWith('@gmail.com')) {
          setError('Only @gmail.com emails are accepted.');
          return;
        }

        let selectedRole = formData.role || 'USER';
        
        // Validate codes for special roles
        if (selectedRole === 'ADMIN' && formData.adminCode !== 'admin123') {
          setError('Invalid Admin Access Code.');
          return;
        }
        if (selectedRole === 'NUTRITIONIST' && formData.adminCode !== 'nutri123') {
          setError('Invalid Nutritionist Access Code.');
          return;
        }
        
        const res = await registerUser({ 
          email: formData.email, 
          password: formData.password, 
          username: formData.email.split('@')[0],
          role: selectedRole 
        });
        onLogin(res.data);
        if (selectedRole === 'ADMIN') navigate('/admin');
        else if (selectedRole === 'NUTRITIONIST') navigate('/nutritionist');
        else navigate('/');
      }
    } catch (err) {
      console.error("Auth Error:", err);
      if (isLogin) loadCaptcha(); // Refresh captcha on failure

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
          {isLogin ? 'NutriTrack Login' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your health journey today.'}
        </p>
      </div>

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

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="role">Register As</label>
            <select 
              id="role"
              name="role"
              value={formData.role || 'USER'}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="USER">Standard User</option>
              <option value="NUTRITIONIST">Nutritionist / Doctor</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        )}

        {isLogin && (
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ margin: 0 }}>Human Verification</label>
              <button 
                type="button" 
                onClick={loadCaptcha} 
                style={{ width: 'auto', background: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', padding: 0 }}
              >
                ↻ Refresh
              </button>
            </div>
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
              {captcha.text}
            </div>
            <input 
              type="text" 
              placeholder="Enter text above" 
              value={userAnswer} 
              onChange={(e) => setUserAnswer(e.target.value)} 
              required 
            />
          </div>
        )}

        {!isLogin && (formData.role === 'ADMIN' || formData.role === 'NUTRITIONIST') && (
          <div className="form-group">
            <label htmlFor="adminCode">Access Code</label>
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              placeholder={formData.role === 'ADMIN' ? "Admin Code (admin123)" : "Nutritionist Code (nutri123)"}
              required
            />
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ height: '3.5rem', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem' }}>
          {isLogin ? `Log In` : `Sign Up`}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? "Need a personal account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
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
