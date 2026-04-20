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
  const [meds, setMeds] = useState([]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

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
      fetchMeds();
    }
  }, [user]);

  const fetchMeds = async () => {
    try {
      const res = await axios.get(`${API_BASE}/medications/user/${user.id}`);
      setMeds(res.data);
    } catch (err) {
      console.error("Med fetch error", err);
    }
  };

  const handleAddMed = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/medications`, {
        ...newMed,
        user: { id: user.id }
      });
      setNewMed({ name: '', dosage: '', frequency: '' });
      setShowMedForm(false);
      fetchMeds();
    } catch (err) {
      console.error("Add med error", err);
    }
  };

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
        
        {/* Medication Panel for User */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>💊 My Medications</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Tracking your meds helps our experts provide better advice.
          </p>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {meds.length > 0 ? (
              meds.map(m => (
                <div key={m.id} style={{ padding: '0.8rem', background: 'var(--secondary-color)', borderRadius: '0.75rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <strong>{m.name}</strong> - {m.dosage} ({m.frequency})
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', opacity: 0.6, textAlign: 'center' }}>No medications logged.</p>
            )}
          </div>

          {!showMedForm ? (
            <button className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => setShowMedForm(true)}>
              + Add Medication
            </button>
          ) : (
            <form onSubmit={handleAddMed} style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <input 
                type="text" placeholder="Name (e.g. Vitamin D)" 
                required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})}
                style={{ marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
              />
              <input 
                type="text" placeholder="Dosage (e.g. 500mg)" 
                required value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                style={{ marginBottom: '0.5rem', padding: '0.5rem', width: '100%' }}
              />
               <input 
                type="text" placeholder="Frequency (e.g. Once daily)" 
                required value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})}
                style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '0.8rem', height: '2.5rem' }}>Save</button>
                <button type="button" className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', height: '2.5rem' }} onClick={() => setShowMedForm(false)}>Cancel</button>
              </div>
            </form>
          )}
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
