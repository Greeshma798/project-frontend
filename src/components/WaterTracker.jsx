import { useState, useEffect } from 'react';
import { getWaterLogs, createWaterLog } from '../services/api';

export default function WaterTracker({ user }) {
  const [amount, setAmount] = useState(0);
  const goal = 2500; // 2.5 Liters

  useEffect(() => {
    fetchWater();
  }, [user]);

  const fetchWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await getWaterLogs(user.id, today);
      const total = res.data.reduce((sum, log) => sum + log.amountMl, 0);
      setAmount(total);
    } catch (err) {
      console.error("Failed to fetch water logs", err);
    }
  };

  const addWater = async (ml) => {
    try {
      await createWaterLog({
        userId: user.id,
        amountMl: ml,
        date: new Date().toISOString().split('T')[0]
      });
      fetchWater();
    } catch (err) {
      console.error("Failed to log water", err);
    }
  };

  const progress = Math.min((amount / goal) * 100, 100);

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>Water Tracker</h3>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Goal: {goal}ml</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
          {amount} <span style={{ fontSize: '1rem', fontWeight: '500' }}>ml</span>
        </div>
      </div>

      <div style={{ height: '8px', background: 'var(--secondary-color)', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${progress}%`, 
            background: 'var(--primary-color)', 
            transition: 'width 0.5s ease-out' 
          }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {[250, 500, 1000].map(val => (
          <button 
            key={val} 
            onClick={() => addWater(val)}
            className="btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}
          >
            +{val}ml
          </button>
        ))}
      </div>
    </div>
  );
}
