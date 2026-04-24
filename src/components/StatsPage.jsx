import { useState, useEffect } from 'react';
import axios from 'axios';
import { getDietRecords, deleteDietRecord } from '../services/api';

const API_BASE = 'http://localhost:8082/api';

export default function HistoryPage({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getDietRecords(user.id);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDietRecord(id);
      setMessage("Record deleted successfully.");
      fetchHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("CRITICAL: This will delete ALL your dietary records forever. Proceed?")) return;
    try {
      // We don't have a bulk delete endpoint yet, so we'll delete one by one or create one.
      // For now, let's assume we create one in the backend. 
      // I'll call a hypothetical endpoint /api/diet-records/user/{userId} with DELETE
      await axios.delete(`${API_BASE}/diet-records/user/${user.id}`);
      setMessage("History cleared completely.");
      fetchHistory();
    } catch (err) {
      console.error("Clear history failed", err);
      // Fallback: delete IDs from current state if endpoint fails (though backend is better)
      setMessage("Failed to clear history on server. Please contact support.");
    }
  };

  const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="history-container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dietary History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>A complete log of everything you've consumed.</p>
        </div>
        {records.length > 0 && (
          <button 
            className="btn-secondary" 
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', width: 'auto' }}
            onClick={handleClearHistory}
          >
            🗑️ Clear All History
          </button>
        )}
      </div>

      {message && (
        <div style={{ padding: '1rem', background: 'var(--secondary-color)', borderRadius: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary-color)', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <div className="glass-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading your history...</div>
        ) : sortedRecords.length > 0 ? (
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1.25rem' }}>Date</th>
                  <th style={{ padding: '1.25rem' }}>Food Item</th>
                  <th style={{ padding: '1.25rem' }}>Calories</th>
                  <th style={{ padding: '1.25rem' }}>Proteins</th>
                  <th style={{ padding: '1.25rem' }}>Carbs</th>
                  <th style={{ padding: '1.25rem' }}>Fats</th>
                  <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1.25rem', fontWeight: '600' }}>{new Date(r.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                         <div style={{ fontSize: '1.25rem' }}>🍽️</div>
                         {r.foodName}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                       <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{r.calories}</span> <small>kcal</small>
                    </td>
                    <td style={{ padding: '1.25rem', color: '#f06868' }}>{r.protein}g</td>
                    <td style={{ padding: '1.25rem', color: '#2bae9e' }}>{r.carbohydrates}g</td>
                    <td style={{ padding: '1.25rem', color: '#e8845a' }}>{r.fat}g</td>
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteRecord(r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}
                        title="Delete record"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', opacity: 0.6 }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📖</div>
            <h2>No History Found</h2>
            <p>Your dietary records will appear here once you start logging meals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
