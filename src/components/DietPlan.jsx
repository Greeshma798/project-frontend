import { useState, useEffect } from 'react';
import { getDietPlan, getWeeklyDietPlan } from '../services/api';
import { Link } from 'react-router-dom';

export default function DietPlan({ user }) {
  const [plan, setPlan] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [view, setView] = useState('daily'); // 'daily' or 'weekly'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDailyPlan();
    }
  }, [user]);

  const loadDailyPlan = () => {
    setLoading(true);
    getDietPlan(user.id)
      .then(res => {
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setPlan(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load diet plan", err);
        setError(err.response?.data?.error || "Could not load your diet plan. Please ensure your profile is complete on the Dashboard.");
        setLoading(false);
      });
  };

  const loadWeeklyPlan = () => {
    if (weeklyPlan) {
      setView('weekly');
      return;
    }
    setLoading(true);
    getWeeklyDietPlan(user.id)
      .then(res => {
        if (res.data.error) {
          setError(res.data.error);
          setView('daily');
        } else {
          setWeeklyPlan(res.data);
          setView('weekly');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load weekly plan", err);
        setLoading(false);
      });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>
    <div className="spinner"></div>
    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Crafting your personalized nutrition strategy...</p>
  </div>;

  if (error) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>Profile Incomplete</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
        <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Go to Dashboard to Update Profile
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.6s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(135deg, #15803d, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            South Indian Wellness Plan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Traditional flavors optimized for <strong style={{ color: '#15803d' }}>{plan.goal}</strong>
          </p>
        </div>
        <div style={{ background: 'var(--secondary-color)', padding: '0.4rem', borderRadius: '1.25rem', display: 'flex', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => setView('daily')} 
            style={view === 'daily' ? activeTabStyle : tabStyle}
          >
            📋 Daily Targets
          </button>
          <button 
            onClick={loadWeeklyPlan} 
            style={view === 'weekly' ? activeTabStyle : tabStyle}
          >
            🗓️ Weekly Schedule
          </button>
        </div>
      </header>

      {(plan.healthConsiderations || (plan.deficiencies && plan.deficiencies.length > 0)) && (
          <div className="glass-panel" style={{ 
            marginBottom: '2.5rem', 
            borderLeft: '6px solid #22c55e', 
            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.08), transparent)',
            borderRadius: '1.5rem',
            padding: '1.5rem 2rem'
          }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ background: '#22c55e', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌿</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#15803d', fontSize: '1.1rem' }}>Traditional Wellness Insights</h4>
                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{plan.healthConsiderations}</p>
              </div>
            </div>
          </div>
      )}

      {view === 'daily' ? (
        <div className="grid-container" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2.5rem' }}>
          <section className="glass-panel" style={{ height: 'fit-content', position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', borderBottom: '2px solid rgba(34, 197, 94, 0.2)', paddingBottom: '0.75rem' }}>Daily Targets</h3>
            
            <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
              <div style={{ 
                width: '180px', height: '180px', borderRadius: '50%', border: '8px solid #f1f5f9', 
                margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)', background: 'white'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#15803d', lineHeight: '1' }}>
                  {plan.targetCalories}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800', marginTop: '0.5rem', letterSpacing: '2px' }}>
                  KCAL / DAY
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '3rem' }}>
               <MacroBar label="Protein" value={plan.proteinGrams} unit="g" max="150" color="#10b981" />
               <MacroBar label="Carbohydrates" value={plan.carbGrams} unit="g" max="300" color="#f59e0b" />
               <MacroBar label="Fat" value={plan.fatGrams} unit="g" max="100" color="#3b82f6" />
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--secondary-color)', borderRadius: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>BMR</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{plan.bmr}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--secondary-color)', borderRadius: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TDEE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{plan.tdee}</div>
              </div>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Suggested Daily Structure</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <MealCard name="Breakfast" data={plan.meals.breakfast} icon="🥥" time="8:00 AM" />
              <MealCard name="Lunch" data={plan.meals.lunch} icon="🍛" time="1:00 PM" />
              <MealCard name="Evening Snack" data={plan.meals.snack} icon="☕" time="4:30 PM" />
              <MealCard name="Dinner" data={plan.meals.dinner} icon="🥙" time="8:00 PM" />
            </div>
          </section>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {Object.entries(weeklyPlan).map(([day, meals], idx) => (
            <div key={day} className="glass-panel" style={{ 
              padding: '0', overflow: 'hidden', border: 'none', 
              animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #15803d, #22c55e)', 
                padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{day}</h3>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  {Math.round(meals.calories)} kcal
                </div>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <WeeklyMeal slot="Breakfast" suggestion={meals.breakfast} icon="🌅" />
                <WeeklyMeal slot="Lunch" suggestion={meals.lunch} icon="☀️" />
                <WeeklyMeal slot="Dinner" suggestion={meals.dinner} icon="🌙" />
                <WeeklyMeal slot="Snack" suggestion={meals.snack} icon="🍎" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const tabStyle = {
  padding: '0.6rem 1.4rem',
  borderRadius: '0.75rem',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease'
};

const activeTabStyle = {
  ...tabStyle,
  background: 'rgba(45, 212, 191, 0.15)',
  color: '#2dd4bf',
  boxShadow: '0 4px 12px rgba(45, 212, 191, 0.1)'
};

const WeeklyMeal = ({ slot, suggestion, icon }) => (
  <div style={{ 
    padding: '1rem 1.25rem', 
    background: 'rgba(255,255,255,0.04)', 
    borderRadius: '1rem', 
    display: 'flex', 
    gap: '1rem', 
    alignItems: 'center', 
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.06)'
  }}>
    <div style={{ 
      fontSize: '1.3rem',
      width: '42px', height: '42px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(45, 212, 191, 0.1)',
      borderRadius: '0.75rem',
      flexShrink: 0
    }}>{icon}</div>
    <div>
      <div style={{ fontWeight: '800', color: '#2dd4bf', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.15rem' }}>{slot}</div>
      <div style={{ lineHeight: '1.4', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>{suggestion}</div>
    </div>
  </div>
);

const MacroBar = ({ label, value, unit, max, color }) => {
  const percentage = Math.min(100, Math.max(0, (value / parseFloat(max)) * 100));
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: '500' }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{value}{unit}</span>
      </div>
      <div style={{ height: '8px', background: 'var(--secondary-color)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
      </div>
    </div>
  );
};

const MEAL_COLORS = {
  'Breakfast': { accent: '#f06868', bg: 'rgba(240, 104, 104, 0.08)', border: 'rgba(240, 104, 104, 0.2)' },
  'Lunch':     { accent: '#2bae9e', bg: 'rgba(43, 174, 158, 0.08)',  border: 'rgba(43, 174, 158, 0.2)' },
  'Evening Snack': { accent: '#6b7d93', bg: 'rgba(107, 125, 147, 0.08)', border: 'rgba(107, 125, 147, 0.2)' },
  'Dinner':    { accent: '#e8845a', bg: 'rgba(232, 132, 90, 0.08)',  border: 'rgba(232, 132, 90, 0.2)' },
};

const MealCard = ({ name, data, icon, time }) => {
  const colors = MEAL_COLORS[name] || MEAL_COLORS['Lunch'];
  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'stretch',
      background: 'var(--card-bg)',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      border: 'var(--glass-border)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Color-coded left strip */}
      <div style={{
        width: '6px',
        background: colors.accent,
        flexShrink: 0,
        borderRadius: '0 0 0 0',
      }} />

      {/* Icon block */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: '2.2rem',
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          width: '64px', height: '64px',
          borderRadius: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '1.4rem 1.4rem 1.4rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: '800', color: 'var(--text-primary)' }}>{name}</h3>
              <span style={{
                fontSize: '0.72rem', fontWeight: '700', color: colors.accent,
                background: colors.bg, border: `1px solid ${colors.border}`,
                padding: '0.15rem 0.6rem', borderRadius: '2rem', letterSpacing: '0.5px'
              }}>{time}</span>
            </div>
          </div>
          {/* Calorie badge */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: colors.accent, lineHeight: 1 }}>
              {data.calories}
            </div>
            <div style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
              kcal
            </div>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem', lineHeight: '1.6' }}>
          {data.suggestion}
        </p>
      </div>
    </div>
  );
};


