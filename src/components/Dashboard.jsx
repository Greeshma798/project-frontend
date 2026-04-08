import { getUser, updateUser } from '../services/api';
import DietCharts from './DietCharts';
import WaterTracker from './WaterTracker';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: '', weight: '', height: '', goal: 'maintain', activityLevel: 'moderate', username: '', healthConditions: '', gender: 'FEMALE'
  });
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      getUser(user.id).then(res => {
        setProfile(res.data);
        setFormData({
          age: res.data.age || '',
          weight: res.data.weight || '',
          height: res.data.height || '',
          goal: res.data.goal || 'maintain',
          activityLevel: res.data.activityLevel || 'moderate',
          username: res.data.username || '',
          healthConditions: res.data.healthConditions || '',
          gender: res.data.gender || 'FEMALE'
        });
        if (!res.data.username) {
          setIsSettingUsername(true);
        }
      }).catch(err => console.error("Failed to load profile", err));
      
      fetchAnalysis();
    }
  }, [user]);

  const fetchAnalysis = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analysis/${user.id}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error("Analysis fetch error", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = isSettingUsername
        ? { ...profile, username: formData.username }
        : {
          ...profile,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          goal: formData.goal,
          activityLevel: formData.activityLevel,
          healthConditions: formData.healthConditions,
          username: formData.username || profile.username,
          gender: formData.gender
        };

      const res = await updateUser(user.id, updateData);
      setProfile(res.data);
      setIsEditing(false);
      setIsSettingUsername(false);

      // Update local storage user data to include username
      const savedUser = JSON.parse(localStorage.getItem('diet_user') || '{}');
      savedUser.username = res.data.username;
      localStorage.setItem('diet_user', JSON.stringify(savedUser));

    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  if (!profile && !isEditing) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading profile...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="welcome-section" style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--text-primary), var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Hello, {profile?.username || 'Friend'}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto' }}>
          {analysis?.smartInsight || "Log your meals for today to see your nutritional progress."}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Profile Details</h2>
        {!isEditing && !isSettingUsername && (
          <button className="btn-secondary" style={{ width: 'auto' }} onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {analysis && analysis.targets && (
        <div className="summary-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-card" style={{ alignItems: 'center' }}>
            <span className="stat-value">{Math.round(analysis.todayIntake.calories)}</span>
            <span className="stat-label">In / {Math.round(analysis.targets.calories)} kcal</span>
          </div>
          <div className="stat-card" style={{ alignItems: 'center' }}>
            <span className="stat-value">{Math.round(analysis.todayIntake.protein)}g</span>
            <span className="stat-label">P / {Math.round(analysis.targets.protein)}g Target</span>
          </div>
          <div className="stat-card" style={{ alignItems: 'center' }}>
            <span className="stat-value">{Math.round(analysis.todayIntake.carbs)}g</span>
            <span className="stat-label">C / {Math.round(analysis.targets.carbs)}g Target</span>
          </div>
          <div className="stat-card" style={{ alignItems: 'center' }}>
            <span className="stat-value">{Math.round(analysis.todayIntake.fat)}g</span>
            <span className="stat-label">F / {Math.round(analysis.targets.fat)}g Target</span>
          </div>
        </div>
      )}

      {isSettingUsername ? (
        <div className="setup-username-container">
          <h3>Finish setting up your account</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Please choose a username to continue.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a unique username"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>
              Create Username
            </button>
          </form>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group third">
              <label htmlFor="age">Age</label>
              <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="form-group third">
              <label htmlFor="weight">Weight (kg)</label>
              <input type="number" id="weight" step="0.1" name="weight" value={formData.weight} onChange={handleChange} required />
            </div>
            <div className="form-group quarter">
              <label htmlFor="height">Height (cm)</label>
              <input type="number" id="height" step="0.1" name="height" value={formData.height} onChange={handleChange} required />
            </div>
            <div className="form-group quarter" style={{ flex: 1 }}>
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} style={selectStyle}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="goal">Fitness Goal</label>
              <select id="goal" name="goal" value={formData.goal} onChange={handleChange} style={selectStyle}>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Build Muscle</option>
              </select>
            </div>
            <div className="form-group half">
              <label htmlFor="activityLevel">Activity Level</label>
              <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} style={selectStyle}>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="very_active">Very Active (hard exercise/physical job)</option>
              </select>
            </div>
          </div>



          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Save Profile</button>
            <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => {
              setIsEditing(false);
              if (profile) setFormData({
                age: profile.age || '', weight: profile.weight || '', height: profile.height || '',
                goal: profile.goal || 'maintain', activityLevel: profile.activityLevel || 'moderate'
              });
            }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <ProfileStat label="Account Type" value={profile?.role || 'User'} isSpecial={profile?.role === 'ADMIN'} />
          <ProfileStat label="Gender" value={formatEnumValue(profile?.gender || 'FEMALE')} />
          <ProfileStat label="Age" value={profile?.age ? `${profile.age} years` : 'Not set'} />
          <ProfileStat label="Weight" value={profile?.weight ? `${profile.weight} kg` : 'Not set'} />
          <ProfileStat label="Height" value={profile?.height ? `${profile.height} cm` : 'Not set'} />
          <ProfileStat label="Goal" value={formatEnumValue(profile?.goal)} />
          <ProfileStat label="Activity Level" value={formatEnumValue(profile?.activityLevel)} />
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <DietCharts user={user} />
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <WaterTracker user={user} />
        {/* Placeholder for future features or additional stats */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Daily Routine</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Organize your day for better results.</p>
          <a href="/routine" className="btn-primary" style={{ textDecoration: 'none', width: 'auto' }}>Manage Schedule</a>
        </div>
      </div>
    </div>
  );
}

const ProfileStat = ({ label, value, isSpecial }) => (
  <div style={{ 
    padding: '1.5rem', 
    background: isSpecial ? 'rgba(239, 68, 68, 0.1)' : 'var(--secondary-color)', 
    borderRadius: '1rem',
    border: isSpecial ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'
  }}>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ 
      fontSize: '1.25rem', 
      fontWeight: '700', 
      color: isSpecial ? '#ef4444' : 'var(--text-primary)' 
    }}>{value}</div>
  </div>
);

const formatEnumValue = (val) => {
  if (!val) return 'Not set';
  return val.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const selectStyle = {
  background: 'var(--bg-color)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  width: '100%'
};
