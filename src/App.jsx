import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import DietLogs from './components/DietLogs';
import DietPlan from './components/DietPlan';
import RoutineBuilder from './components/RoutineBuilder';
import WaterPage from './components/WaterPage';
import StatsPage from './components/StatsPage';
import Dashboard from './components/Dashboard'; 
import AdminDashboard from './components/AdminDashboard';
import NutritionistDashboard from './components/NutritionistDashboard';
import ProfessionalConsulting from './components/ProfessionalConsulting';
import './App.css';
import './index.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('diet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('diet_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('diet_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isNutritionist = user?.role === 'NUTRITIONIST';

  return (
    <>
      {isAdmin && (
        <div style={{ 
          background: 'linear-gradient(to right, #ef4444, #f59e0b)', 
          color: 'white', 
          textAlign: 'center', 
          padding: '0.4rem', 
          fontSize: '0.8rem', 
          fontWeight: '700', 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          🛡️ Administrator Mode - Restricted Access
        </div>
      )}
      {isNutritionist && (
        <div style={{ 
          background: 'linear-gradient(to right, #3b82f6, #10b981)', 
          color: 'white', 
          textAlign: 'center', 
          padding: '0.4rem', 
          fontSize: '0.8rem', 
          fontWeight: '700', 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          👨‍⚕️ Nutritionist & Doctor Mode - Professional Portal
        </div>
      )}
      <div className="background-accents">
        <div className="accent-blob blob-1"></div>
        <div className="accent-blob blob-2"></div>
        <div className="accent-blob blob-3"></div>
      </div>

      <nav className="navbar">
        <div className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: `linear-gradient(135deg, ${isAdmin ? '#ef4444' : '#10b981'}, #3b82f6)`, padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
              <path d="M2 21L5 18"></path>
            </svg>
          </div>
          <span style={{ background: 'linear-gradient(to right, var(--primary-color), #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
            NutriTrack {isAdmin && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Admin)</span>}
            {isNutritionist && <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Expert)</span>}
          </span>
        </div>

        {user && (
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {isAdmin ? (
              <>
                <Link to="/admin" style={linkStyle(location.pathname === '/admin', 'ADMIN')}>Admin Console</Link>
                <Link to="/stats" style={linkStyle(location.pathname === '/stats', 'ADMIN')}>System Stats</Link>
              </>
            ) : isNutritionist ? (
              <>
                <Link to="/nutritionist" style={linkStyle(location.pathname === '/nutritionist', 'NUTRITIONIST')}>Patient Portal</Link>
                <Link to="/stats" style={linkStyle(location.pathname === '/stats', 'NUTRITIONIST')}>Analytics</Link>
              </>
            ) : (
              <>
                <Link to="/" style={linkStyle(location.pathname === '/', 'USER')}>Food Log</Link>
                <Link to="/plan" style={linkStyle(location.pathname === '/plan', 'USER')}>My Plan</Link>
                <Link to="/water" style={linkStyle(location.pathname === '/water', 'USER')}>Water</Link>
                <Link to="/consulting" style={linkStyle(location.pathname === '/consulting', 'USER')}>Expert Chat</Link>
                <Link to="/stats" style={linkStyle(location.pathname === '/stats', 'USER')}>History</Link>
                <Link to="/routine" style={linkStyle(location.pathname === '/routine', 'USER')}>Routine</Link>
                <Link to="/dashboard" style={linkStyle(location.pathname === '/dashboard', 'USER')}>Profile</Link>
              </>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user && (
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 1rem', width: 'auto', marginTop: 0, fontSize: '0.85rem' }}>
              Logout
            </button>
          )}
          <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle Theme">
            {theme === 'light' ? (
              <svg className="theme-icon sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg className="theme-icon moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </nav>

      <main className="dashboard" style={(isAdmin || isNutritionist) ? { maxWidth: '1400px' } : {}}>
        {user ? (
          <Routes>
            <Route path="/" element={(isAdmin) ? <Navigate to="/admin" replace /> : (isNutritionist ? <Navigate to="/nutritionist" replace /> : <DietLogs user={user} />)} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/plan" element={<DietPlan user={user} />} />
            <Route path="/water" element={<WaterPage user={user} />} />
            <Route path="/stats" element={<StatsPage user={user} />} />
            <Route path="/routine" element={<RoutineBuilder user={user} />} />
            <Route path="/consulting" element={<ProfessionalConsulting user={user} />} />
            
            <Route 
              path="/admin" 
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/nutritionist" 
              element={isNutritionist ? <NutritionistDashboard nutritionist={user} /> : <Navigate to="/" replace />} 
            />
            
            <Route path="*" element={<Navigate to={isAdmin ? "/admin" : (isNutritionist ? "/nutritionist" : "/")} replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<AuthPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </>
  );
}

const linkStyle = (isActive, role) => {
  const activeColor = role === 'ADMIN' ? '#ef4444' : 'var(--primary-color)';
  return {
    color: isActive ? activeColor : 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: isActive ? '700' : '500',
    padding: '0.5rem 0',
    borderBottom: isActive ? `2px solid ${activeColor}` : '2px solid transparent',
    transition: 'all 0.2s',
    opacity: isActive ? 1 : 0.8
  };
};

export default App;