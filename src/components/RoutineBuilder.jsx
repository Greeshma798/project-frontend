import { useState, useEffect } from 'react';
import { getRoutines, createRoutine, deleteRoutine } from '../services/api';

export default function RoutineBuilder({ user }) {
  const [routines, setRoutines] = useState([]);
  const [formData, setFormData] = useState({ time: '', activity: '' });

  useEffect(() => {
    fetchRoutines();
  }, [user]);

  const fetchRoutines = async () => {
    try {
      const res = await getRoutines(user.id);
      setRoutines(res.data.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (err) {
      console.error("Failed to fetch routines", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRoutine({ ...formData, userId: user.id });
      setFormData({ time: '', activity: '' });
      fetchRoutines();
    } catch (err) {
      console.error("Failed to add routine", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoutine(id);
      fetchRoutines();
    } catch (err) {
      console.error("Failed to delete routine", err);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Daily Routine Builder</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <input 
            type="time" 
            value={formData.time} 
            onChange={(e) => setFormData({...formData, time: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
          <input 
            type="text" 
            placeholder="What's the plan? (e.g., Breakfast, Gym)" 
            value={formData.activity} 
            onChange={(e) => setFormData({...formData, activity: e.target.value})} 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Add</button>
      </form>

      <div className="routine-list">
        {routines.length > 0 ? (
          routines.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                background: 'var(--secondary-color)', 
                borderRadius: '0.75rem', 
                marginBottom: '1rem' 
              }}
            >
              <div>
                <span style={{ fontWeight: '600', marginRight: '1rem', color: 'var(--primary-color)' }}>{item.time}</span>
                <span>{item.activity}</span>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No routine planned yet.</p>
        )}
      </div>
    </div>
  );
}
