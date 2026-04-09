import { useState, useEffect, useRef } from 'react';
import { getWaterLogs, createWaterLog } from '../services/api';

export default function WaterTracker({ user }) {
  const [amount, setAmount] = useState(0);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(60);
  const goal = 2500;
  const timerRef = useRef(null);

  useEffect(() => {
    fetchWater();
    const savedReminders = localStorage.getItem(`water_reminders_${user.id}`);
    const savedInterval = localStorage.getItem(`water_interval_${user.id}`);
    if (savedReminders === 'true') setRemindersEnabled(true);
    if (savedInterval) setReminderInterval(Number(savedInterval));
  }, [user]);

  useEffect(() => {
    if (remindersEnabled) startReminders();
    else stopReminders();
    return () => stopReminders();
  }, [remindersEnabled, reminderInterval]);

  const fetchWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await getWaterLogs(user.id, today);
      const total = res.data.reduce((sum, log) => sum + log.amountMl, 0);
      setAmount(total);
    } catch (err) { console.error("Failed to fetch water logs", err); }
  };

  const addWater = async (ml) => {
    try {
      await createWaterLog({ userId: user.id, amountMl: ml, date: new Date().toISOString().split('T')[0] });
      fetchWater();
    } catch (err) { console.error("Failed to log water", err); }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) { alert("Browser doesn't support notifications"); return false; }
    if (Notification.permission === "granted") return true;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  };

  const toggleReminders = async () => {
    if (!remindersEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) { setRemindersEnabled(true); localStorage.setItem(`water_reminders_${user.id}`, 'true'); }
    } else {
      setRemindersEnabled(false);
      localStorage.setItem(`water_reminders_${user.id}`, 'false');
    }
  };

  const startReminders = () => {
    stopReminders();
    timerRef.current = setInterval(showNotification, reminderInterval * 60000);
  };

  const stopReminders = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const showNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Hydration Check! 💧", { body: "Time for a quick sip of water. Stay energized!" });
    }
  };

  const handleIntervalChange = (e) => {
    const val = Number(e.target.value);
    setReminderInterval(val);
    localStorage.setItem(`water_interval_${user.id}`, val);
  };

  const progress = Math.min((amount / goal) * 100, 100);
  const liters = (amount / 1000).toFixed(1);

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      <style>{`
        .wave-container {
          position: relative;
          width: 165px;
          height: 165px;
          border-radius: 50%;
          margin: 1.25rem auto;
          overflow: hidden;
          border: 4px solid var(--border-color);
          box-shadow: 0 8px 30px rgba(30, 144, 255, 0.15), inset 0 2px 10px rgba(0,0,0,0.06);
          background: var(--secondary-color);
        }
        [data-theme="dark"] .wave-container {
          border-color: rgba(30,144,255,0.25);
          box-shadow: 0 8px 30px rgba(30,144,255,0.12), inset 0 2px 10px rgba(0,0,0,0.3);
        }
        .wave {
          position: absolute;
          bottom: 0; left: 0;
          width: 200%; height: 100%;
          background: linear-gradient(180deg, #38bdf8, #0284c7);
          opacity: 0.85;
          border-radius: 38% 42% 40% 45%;
          animation: waveRotate 8s linear infinite;
          transition: transform 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        .wave::after {
          content: "";
          position: absolute;
          top: -5%; left: 0;
          width: 100%; height: 100%;
          background: rgba(255,255,255,0.15);
          border-radius: 45% 40% 43% 38%;
          animation: waveRotate 13s linear infinite;
        }
        @keyframes waveRotate {
          from { transform: translateX(-25%) rotate(0deg); }
          to   { transform: translateX(-25%) rotate(360deg); }
        }
        .water-add-btn {
          flex: 1;
          background: var(--secondary-color);
          border: 1.5px solid var(--border-color);
          border-radius: 1rem;
          color: var(--primary-color);
          padding: 0.7rem 0.5rem;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          width: auto;
        }
        .water-add-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(108,99,255,0.25);
        }
        [data-theme="dark"] .water-add-btn:hover {
          box-shadow: 0 4px 14px rgba(45,212,191,0.2);
        }
        .hydra-switch {
          position: relative; display: inline-block;
          width: 50px; height: 26px; flex-shrink: 0;
        }
        .hydra-switch input { opacity: 0; width: 0; height: 0; }
        .hydra-slider {
          position: absolute;
          cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background: var(--secondary-color);
          border: 1.5px solid var(--border-color);
          transition: .3s; border-radius: 26px;
        }
        .hydra-slider:before {
          position: absolute; content: "";
          height: 20px; width: 20px; left: 2px; bottom: 2px;
          background: var(--text-secondary);
          transition: .3s; border-radius: 50%;
        }
        .hydra-switch input:checked + .hydra-slider {
          background: var(--accent-color);
          border-color: var(--accent-color);
        }
        .hydra-switch input:checked + .hydra-slider:before {
          transform: translateX(24px); background: white;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '800' }}>
            💧 Hydration Portal
          </h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Daily goal: {goal}ml
          </p>
        </div>
        <div style={{
          background: progress >= 100 ? 'var(--success-color)' : 'var(--accent-color)',
          color: 'white',
          padding: '0.3rem 0.85rem',
          borderRadius: '2rem',
          fontSize: '0.8rem',
          fontWeight: '800',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {Math.round(progress)}%
        </div>
      </div>

      {/* Wave Circle */}
      <div className="wave-container">
        <div className="wave" style={{ transform: `translateY(${100 - progress}%) translateX(-25%)`, height: '200%' }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', zIndex: 10
        }}>
          <div style={{
            fontSize: '2rem', fontWeight: '900', lineHeight: 1,
            color: progress > 45 ? 'white' : 'var(--primary-color)',
            textShadow: progress > 45 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
          }}>
            {liters}L
          </div>
          <div style={{
            fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '1px', marginTop: '0.2rem',
            color: progress > 45 ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'
          }}>
            {amount} ml
          </div>
        </div>
      </div>

      {/* Add Water Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
        {[250, 500, 1000].map(val => (
          <button key={val} onClick={() => addWater(val)} className="water-add-btn">
            +{val}
          </button>
        ))}
      </div>

      {/* Reminder Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginTop: 'auto', paddingTop: '1.5rem',
        borderTop: '1.5px dashed var(--border-color)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>🔔 Reminders</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            {remindersEnabled
              ? `Notifying every ${reminderInterval < 60 ? `${reminderInterval} min` : `${reminderInterval / 60} hr`}`
              : 'Enable hydration alerts'}
          </div>
        </div>
        <label className="hydra-switch">
          <input type="checkbox" checked={remindersEnabled} onChange={toggleReminders} />
          <span className="hydra-slider"></span>
        </label>
      </div>

      {remindersEnabled && (
        <div style={{ marginTop: '0.85rem', animation: 'fadeIn 0.3s ease' }}>
          <select value={reminderInterval} onChange={handleIntervalChange}>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every 1 hour</option>
            <option value={120}>Every 2 hours</option>
          </select>
        </div>
      )}
    </div>
  );
}
