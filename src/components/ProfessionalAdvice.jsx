import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

export default function ProfessionalAdvice({ user }) {
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recommendations/user/${user.id}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error("Error fetching recommendations", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/recommendations/request`, {
        userId: user.id,
        userMessage: message,
      });
      setMessage('');
      setFeedback('Your request has been sent to our expert nutritionists!');
      fetchRecommendations();
    } catch (err) {
      setFeedback('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>🥗</span> Professional Recommendations
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8 }}>Request New Advice</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Tell our experts what you're looking for (e.g., "Need a high-protein vegetarian diet for muscle gain" or "Having trouble with evening cravings").
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your request here..."
              required
              rows="4"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem',
                fontFamily: 'inherit'
              }}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </form>
          {feedback && <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--primary-color)' }}>{feedback}</p>}
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8 }}>Latest Advice</h3>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div key={rec.id} style={{ 
                  background: 'var(--secondary-color)', 
                  padding: '1rem', 
                  borderRadius: '1rem', 
                  marginBottom: '1rem',
                  border: rec.status === 'RESPONDED' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: rec.status === 'RESPONDED' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                      {rec.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{rec.userMessage}"</p>
                  {rec.nutritionistNote && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Expert Response:</strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rec.nutritionistNote}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                No recommendations yet. Request one to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
