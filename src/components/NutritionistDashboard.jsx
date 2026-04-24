import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

export default function NutritionistDashboard({ nutritionist }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [dietNote, setDietNote] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' or 'requests'

  useEffect(() => {
    fetchUsers();
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users-health`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recommendations/pending`);
      setPendingRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    setActiveTab('patients');
    try {
      const dietRes = await axios.get(`${API_BASE}/diet-records?userId=${u.id}`);
      setUserActivity(dietRes.data);
    } catch (err) {
      console.error("Error fetching user activity", err);
    }
  };

  const handleRespondToRequest = async (recId, note) => {
    if (!note) return;
    try {
      await axios.put(`${API_BASE}/recommendations/respond/${recId}`, {
        nutritionistId: nutritionist.id,
        nutritionistNote: note
      });
      setMessage('Recommendation sent successfully!');
      fetchPendingRequests();
    } catch (err) {
      setMessage('Failed to send response.');
    }
  };

  return (
    <div className="nutritionist-dashboard">
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0 }}>Expert Consulting Portal</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={activeTab === 'patients' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('patients')}
            style={{ width: 'auto' }}
          >
            Patients & Activity
          </button>
          <button 
            className={activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('requests')}
            style={{ position: 'relative', width: 'auto' }}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-10px', right: '-10px', 
                background: '#ef4444', color: 'white', 
                borderRadius: '50%', padding: '2px 8px', fontSize: '0.7rem' 
              }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid-container" style={{ gridTemplateColumns: activeTab === 'patients' ? '1fr 1.5fr' : '1fr', gap: '2rem' }}>
        {activeTab === 'patients' ? (
          <>
            <div className="glass-panel">
              <h2 style={{ marginBottom: '1.5rem' }}>Patient Directory</h2>
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem' }}>User</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        background: selectedUser?.id === u.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent' 
                      }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600' }}>{u.username}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.weight}kg · {u.height}cm</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => handleSelectUser(u)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}>
                            View Activity
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>Activity: {selectedUser.username}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Goal: {selectedUser.goal} · Activity: {selectedUser.activityLevel}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Food Journal</h3>
                    {userActivity.length > 0 ? (
                      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead style={{ position: 'sticky', top: 0, background: 'var(--secondary-color)' }}>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                              <th style={{ padding: '0.75rem' }}>Date</th>
                              <th style={{ padding: '0.75rem' }}>Food Item</th>
                              <th style={{ padding: '0.75rem' }}>Calories</th>
                              <th style={{ padding: '0.75rem' }}>Macros (P/C/F)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userActivity.map(record => (
                              <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.75rem' }}>{new Date(record.date).toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem', fontWeight: '500' }}>{record.foodName}</td>
                                <td style={{ padding: '0.75rem' }}>{record.calories}</td>
                                <td style={{ padding: '0.75rem' }}>{record.protein}g / {record.carbohydrates}g / {record.fat}g</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(0,0,0,0.1)', borderRadius: '1rem', opacity: 0.6 }}>
                        No diet records found for this user.
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <h3>Send New Advice</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Add a professional note or adjustment to their current plan.
                    </p>
                    <textarea 
                      rows="4" 
                      placeholder="Enter your expert recommendations here..." 
                      value={dietNote}
                      onChange={(e) => setDietNote(e.target.value)}
                      style={{ 
                        width: '100%', padding: '1rem', borderRadius: '0.75rem', 
                        background: 'var(--bg-color)', border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'inherit' 
                      }}
                    />
                    <button 
                      onClick={async () => {
                        if (!dietNote) return;
                        try {
                          await axios.post(`${API_BASE}/recommendations/request`, {
                            userId: selectedUser.id,
                            userMessage: "[Consultation Update]",
                            nutritionistId: nutritionist.id,
                            nutritionistNote: dietNote,
                            status: 'RESPONDED'
                          });
                          setMessage('Recommendation saved successfully!');
                          setDietNote('');
                        } catch(e) { setMessage('Failed to save.'); }
                      }} 
                      className="btn-primary"
                      style={{ width: 'auto' }}
                    >
                      Save Advice
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
                    <h2>No Patient Selected</h2>
                    <p>Choose a patient from the list to view their food journal and provide expert consulting.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass-panel">
            <h2 style={{ marginBottom: '2rem' }}>Pending Requests</h2>
            {pendingRequests.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {pendingRequests.map(req => {
                   const requester = users.find(u => u.id === req.userId);
                   return (
                    <RequestCard 
                      key={req.id} 
                      req={req} 
                      user={requester} 
                      onRespond={handleRespondToRequest} 
                    />
                   );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '6rem', opacity: 0.6 }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
                <h3>All Caught Up!</h3>
                <p>There are no pending recommendation requests at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {message && (
        <div style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', 
          background: 'var(--primary-color)', color: 'white', 
          padding: '1rem 2rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 1000, animation: 'slideUp 0.3s ease-out'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, user, onRespond }) {
  const [note, setNote] = useState('');

  return (
    <div style={{ 
      background: 'var(--secondary-color)', 
      padding: '1.5rem', 
      borderRadius: '1.25rem', 
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user?.username || 'Member'}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(req.createdAt).toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          NEW REQUEST
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        padding: '1rem', 
        borderRadius: '0.75rem', 
        borderLeft: '4px solid var(--primary-color)',
        fontSize: '0.95rem',
        fontStyle: 'italic'
      }}>
        "{req.userMessage}"
      </div>

      <textarea 
        placeholder="Type your professional recommendation..." 
        rows="3"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ 
          width: '100%', padding: '1rem', borderRadius: '0.75rem', 
          background: 'var(--bg-color)', color: 'var(--text-primary)', 
          border: '1px solid var(--border-color)', fontFamily: 'inherit' 
        }}
      />
      
      <button 
        className="btn-primary" 
        style={{ width: '100%' }}
        onClick={() => onRespond(req.id, note)}
      >
        Submit Recommendation
      </button>
    </div>
  );
}
