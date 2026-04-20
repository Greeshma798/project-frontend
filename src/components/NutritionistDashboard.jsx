import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

export default function NutritionistDashboard({ nutritionist }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dietNote, setDietNote] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users-health`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      // For now, we'll just save it as a "healthCondition" or a new field if we want.
      // Let's assume we update the user's healthConditions with the nutritionist's advice.
      await axios.put(`${API_BASE}/users/${selectedUser.id}`, {
        ...selectedUser,
        healthConditions: `[Nutritionist Note: ${dietNote}]`
      });
      setMessage('Diet plan/note assigned successfully!');
      setDietNote('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setMessage('Failed to assign plan.');
    }
  };

  return (
    <div className="nutritionist-dashboard">
      <h1 style={{ marginBottom: '2.5rem' }}>Nutritionist & Doctor Portal</h1>
      
      <div className="grid-container" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr' }}>
        <div className="glass-panel">
          <h2>Patient List</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Age</th>
                  <th>Metrics (W/H)</th>
                  <th>Goal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </td>
                    <td>{u.age || '-'}</td>
                    <td>{u.weight}kg / {u.height}cm</td>
                    <td>{u.goal}</td>
                    <td>
                      <button onClick={() => setSelectedUser(u)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Manage Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel">
          {selectedUser ? (
            <>
              <h2>Assign Plan for {selectedUser.username}</h2>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--secondary-color)', borderRadius: '1rem' }}>
                <p><strong>Age:</strong> {selectedUser.age}</p>
                <p><strong>Weight:</strong> {selectedUser.weight}kg</p>
                <p><strong>Height:</strong> {selectedUser.height}cm</p>
              </div>
              <form onSubmit={handleAssignPlan}>
                <div className="form-group">
                  <label>Professional Advice / Diet Recommendation</label>
                  <textarea 
                    rows="6" 
                    placeholder="Enter detailed diet plan or medical advice..." 
                    value={dietNote}
                    onChange={(e) => setDietNote(e.target.value)}
                    required
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
                <button type="submit" className="btn-primary">Submit Recommendations</button>
                <button type="button" onClick={() => setSelectedUser(null)} className="btn-secondary" style={{ marginLeft: '1rem' }}>Cancel</button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p>Select a patient from the list to manage their diet plan.</p>
            </div>
          )}
          {message && <div style={{ marginTop: '1rem', color: 'var(--primary-color)', textAlign: 'center', fontWeight: '600' }}>{message}</div>}
        </div>
      </div>
    </div>
  );
}
