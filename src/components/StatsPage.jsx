import { useState, useEffect } from 'react';
import axios from 'axios';
import DietCharts from './DietCharts';

const API_BASE = 'http://localhost:8081/api';

export default function StatsPage({ user }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, [user]);

  const fetchAnalysis = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analysis/${user.id}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error("Failed to fetch analysis", err);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Nutrition Insights</h1>
      
      {analysis && analysis.alerts && analysis.alerts.length > 0 && (
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--danger-color)', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Nutrient Alerts for {analysis.classification}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {analysis.alerts.map((alert, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(248, 113, 113, 0.05)', borderRadius: '1rem', border: '1px solid rgba(248, 113, 113, 0.1)' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{alert.message}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <strong>Recommendation:</strong> {alert.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis && analysis.alerts && analysis.alerts.length === 0 && (
        <div className="glass-panel" style={{ borderLeft: '4px solid #10b981', marginBottom: '2rem' }}>
          <h2 style={{ color: '#10b981' }}>Healthy Growth Status</h2>
          <p>Your current nutrient intake meets the Recommended Dietary Allowance (RDA) for {analysis.classification}s. Keep it up!</p>
        </div>
      )}

      <DietCharts user={user} />
    </div>
  );
}
