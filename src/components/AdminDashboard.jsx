import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

export default function AdminDashboard() {
  const [standards, setStandards] = useState([]);
  const [usersSummary, setUsersSummary] = useState([]);
  const [newStandard, setNewStandard] = useState({
    nutrientName: '', ageRange: '', gender: 'BOTH', targetValue: '', unit: ''
  });

  useEffect(() => {
    fetchStandards();
    fetchUsersHealth();
  }, []);

  const fetchStandards = async () => {
    const res = await axios.get(`${API_BASE}/admin/standards`);
    setStandards(res.data);
  };

  const fetchUsersHealth = async () => {
    const res = await axios.get(`${API_BASE}/admin/users-health`);
    setUsersSummary(res.data);
  };

  const handleCreateStandard = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/admin/standards`, newStandard);
    setNewStandard({ nutrientName: '', ageRange: '', gender: 'BOTH', targetValue: '', unit: '' });
    fetchStandards();
  };

  const handleDeleteStandard = async (id) => {
    await axios.delete(`${API_BASE}/admin/standards/${id}`);
    fetchStandards();
  };

  return (
    <div className="admin-dashboard">
      <h1 style={{ marginBottom: '2.5rem' }}>Administrator Console</h1>

      <div className="grid-container" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 2fr' }}>
        {/* Manage RDA Standards */}
        <div className="glass-panel">
          <h2>Manage Nutritional Standards (RDA)</h2>
          <form onSubmit={handleCreateStandard} style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Nutrient Name</label>
              <input 
                type="text" 
                placeholder="e.g., Protein" 
                value={newStandard.nutrientName} 
                onChange={e => setNewStandard({...newStandard, nutrientName: e.target.value})} 
                required 
              />
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Age Range</label>
                <input 
                  type="text" 
                  placeholder="e.g., 14-18" 
                  value={newStandard.ageRange} 
                  onChange={e => setNewStandard({...newStandard, ageRange: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group half">
                <label>Gender</label>
                <select 
                  value={newStandard.gender} 
                  onChange={e => setNewStandard({...newStandard, gender: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="BOTH">Both</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Target Value</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={newStandard.targetValue} 
                  onChange={e => setNewStandard({...newStandard, targetValue: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group half">
                <label>Unit</label>
                <input 
                  type="text" 
                  placeholder="g, mg, kcal" 
                  value={newStandard.unit} 
                  onChange={e => setNewStandard({...newStandard, unit: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Standard</button>
          </form>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th>Age</th>
                  <th>Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {standards.map(s => (
                  <tr key={s.id}>
                    <td>{s.nutrientName}</td>
                    <td>{s.ageRange} ({s.gender.charAt(0)})</td>
                    <td>{s.targetValue}{s.unit}</td>
                    <td>
                      <button onClick={() => handleDeleteStandard(s.id)} className="icon-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monitor User Health */}
        <div className="glass-panel">
          <h2>User Health Monitoring</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Age</th>
                  <th>Metrics (W/H)</th>
                  <th>Goal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersSummary.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </td>
                    <td>{u.age || '-'}</td>
                    <td>{u.weight}kg / {u.height}cm</td>
                    <td>{u.goal || 'Maintain'}</td>
                    <td>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
