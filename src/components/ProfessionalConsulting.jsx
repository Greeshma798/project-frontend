import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

export default function ProfessionalConsulting({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 10000); // Poll for new messages
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChat = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recommendations/user/${user.id}`);
      // Transform recommendations into chat messages
      const chatLines = [];
      res.data.forEach(rec => {
        chatLines.push({
          id: `req-${rec.id}`,
          text: rec.userMessage,
          sender: 'user',
          time: rec.createdAt
        });
        if (rec.nutritionistNote) {
          chatLines.push({
            id: `res-${rec.id}`,
            text: rec.nutritionistNote,
            sender: 'nutritionist',
            time: rec.respondedAt,
            isPlan: rec.nutritionistNote.includes('PLAN:')
          });
        }
      });
      // Sort by time
      chatLines.sort((a, b) => new Date(a.time) - new Date(b.time));
      setMessages(chatLines);
    } catch (err) {
      console.error("Chat fetch error", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/recommendations/request`, {
        userId: user.id,
        userMessage: input,
      });
      setInput('');
      fetchChat();
    } catch (err) {
      setFeedback('Error sending message.');
    } finally {
      setLoading(false);
    }
  };

  const applyPlanToSchedule = async (text) => {
    const planMatch = text.match(/PLAN:([\s\S]*)/);
    if (!planMatch) return;
    
    const planText = planMatch[1];
    const items = planText.split(';').map(i => i.trim()).filter(i => i);
    
    try {
      setFeedback('Applying plan to your profile...');
      
      // Save it to the user's customDietPlan field
      const updatedUser = { ...user, customDietPlan: text };
      await axios.put(`${API_BASE}/users/${user.id}`, updatedUser);
      
      // Also add to routine as before
      for (const item of items) {
        const [time, ...activityParts] = item.split('-');
        const activity = activityParts.join('-').trim();
        if (time && activity) {
          await axios.post(`${API_BASE}/routines`, {
            userId: user.id,
            time: time.trim(),
            activity: activity
          });
        }
      }
      setFeedback('Success! Check your "My Plan" page to enable it.');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback('Failed to apply plan.');
    }
  };

  return (
    <div className="consulting-container" style={{ maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.75rem', borderRadius: '1rem', fontSize: '1.5rem' }}>🧑‍⚕️</div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Expert Consulting</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chat with our nutritionists for personalized adjustments.</p>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="glass-panel chat-box" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          background: 'rgba(var(--bg-rgb), 0.5)',
          borderRadius: '1.5rem',
          border: '1px solid var(--border-color)'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', opacity: 0.5 }}>
             <p>Start a conversation with our experts.</p>
             <p style={{ fontSize: '0.8rem' }}>Ask for a diet plan or share your health goals.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ 
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                padding: '0.8rem 1.2rem', 
                borderRadius: m.sender === 'user' ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                background: m.sender === 'user' ? 'var(--primary-color)' : 'var(--secondary-color)',
                color: m.sender === 'user' ? 'white' : 'var(--text-primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {m.sender === 'nutritionist' && <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.3rem', opacity: 0.8 }}>EXPERT ADVICE</div>}
                {m.text}
                
                {m.isPlan && (
                  <button 
                    onClick={() => applyPlanToSchedule(m.text)}
                    style={{ 
                      marginTop: '0.8rem', 
                      width: '100%', 
                      background: 'rgba(var(--primary-rgb), 0.2)', 
                      border: '1px solid var(--primary-color)',
                      color: 'var(--primary-color)',
                      padding: '0.4rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Add to Schedule
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.3rem' }}>
                {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Type your health query or request a diet plan..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ 
            flex: 1, 
            padding: '1rem 1.5rem', 
            borderRadius: '1.5rem', 
            background: 'var(--secondary-color)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit'
          }}
        />
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading || !input.trim()}
          style={{ width: 'auto', padding: '0 2rem', borderRadius: '1.5rem' }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
      {feedback && <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{feedback}</div>}
    </div>
  );
}
