import { useState, useEffect } from 'react';
import { getDietRecords, createDietRecord, updateDietRecord, deleteDietRecord } from '../services/api';

const API_BASE = 'http://localhost:8081/api';

export default function DietLogs({ user }) {
  const [records, setRecords] = useState([]);
  
  const [formData, setFormData] = useState({
    id: null,
    foodName: '',
    calories: '',
    date: new Date().toISOString().split('T')[0],
    protein: '',
    carbohydrates: '',
    fat: '',
    vitaminA: '',
    vitaminC: '',
    vitaminD: '',
    iron: '',
    calcium: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (user?.id) fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await getDietRecords(user.id);
      setRecords(res.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      userId: user.id,
      calories: parseInt(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbohydrates: parseFloat(formData.carbohydrates) || 0,
      fat: parseFloat(formData.fat) || 0,
      vitaminA: parseFloat(formData.vitaminA) || 0,
      vitaminC: parseFloat(formData.vitaminC) || 0,
      vitaminD: parseFloat(formData.vitaminD) || 0,
      iron: parseFloat(formData.iron) || 0,
      calcium: parseFloat(formData.calcium) || 0,
    };

    try {
      if (formData.id) {
        await updateDietRecord(formData.id, payload);
      } else {
        await createDietRecord(payload);
      }
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Error submitting record:', error);
    }
  };

  const editRecord = (record) => {
    setFormData({
      id: record.id,
      foodName: record.foodName,
      calories: record.calories,
      date: record.date,
      protein: record.protein || '',
      carbohydrates: record.carbohydrates || '',
      fat: record.fat || '',
      vitaminA: record.vitaminA || '',
      vitaminC: record.vitaminC || '',
      vitaminD: record.vitaminD || '',
      iron: record.iron || '',
      calcium: record.calcium || '',
    });
    setShowAdvanced(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteDietRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      foodName: '',
      calories: '',
      date: new Date().toISOString().split('T')[0],
      protein: '',
      carbohydrates: '',
      fat: '',
      vitaminA: '',
      vitaminC: '',
      vitaminD: '',
      iron: '',
      calcium: '',
    });
    setShowAdvanced(false);
  };

  const todayCalories = records
    .filter(r => r.date === new Date().toISOString().split('T')[0])
    .reduce((sum, r) => sum + r.calories, 0);

  const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

  const quickItems = [
    { name: 'Apple', cal: 95, p: 0.5, c: 25, f: 0.3 },
    { name: 'Egg (Boiled)', cal: 78, p: 6, c: 0.6, f: 5 },
    { name: 'Almonds (10)', cal: 70, p: 2.5, c: 2.5, f: 6 },
    { name: 'Avocado', cal: 160, p: 2, c: 8.5, f: 15 },
    { name: 'Milk (Glass)', cal: 120, p: 8, c: 12, f: 5 }
  ];

  const handleQuickAdd = async (item) => {
    try {
      await createDietRecord({
        foodName: item.name,
        calories: item.cal,
        protein: item.p,
        carbohydrates: item.c,
        fat: item.f,
        userId: user.id,
        date: new Date().toISOString().split('T')[0]
      });
      fetchRecords();
    } catch (err) {
      console.error("Quick add failed", err);
    }
  };

  return (
    <div className="diet-logs-container">
      <header className="dashboard-header">
        <div>
          <h1>Your Dietary Logs</h1>
          <p>Track your daily meals and manually log the food you eat.</p>
        </div>
        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-value">{todayCalories}</span>
            <span className="stat-label">Intake Today (kcal)</span>
          </div>
        </div>
      </header>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2>Quick add common items</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {quickItems.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => handleQuickAdd(item)}
              className="chip-btn"
              style={{ 
                width: 'auto', 
                background: 'var(--secondary-color)', 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>+</span> {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-container">
        <section className="glass-panel form-section">
          <h2>{formData.id ? 'Edit Meal' : 'Add Meal'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="foodName">Food/Meal Name</label>
              <input type="text" id="foodName" required placeholder="e.g. Avocado Toast" value={formData.foodName} onChange={handleChange} />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="calories">Calories (kcal)</label>
                <input type="number" id="calories" required min="0" placeholder="0" value={formData.calories} onChange={handleChange} />
              </div>
              <div className="form-group half">
                <label htmlFor="date">Date</label>
                <input type="date" id="date" required value={formData.date} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group third">
                <label htmlFor="protein">Protein (g)</label>
                <input type="number" id="protein" step="0.1" min="0" placeholder="0" value={formData.protein} onChange={handleChange} />
              </div>
              <div className="form-group third">
                <label htmlFor="carbohydrates">Carbs (g)</label>
                <input type="number" id="carbohydrates" step="0.1" min="0" placeholder="0" value={formData.carbohydrates} onChange={handleChange} />
              </div>
              <div className="form-group third">
                <label htmlFor="fat">Fat (g)</label>
                <input type="number" id="fat" step="0.1" min="0" placeholder="0" value={formData.fat} onChange={handleChange} />
              </div>
            </div>

            <div style={{ margin: '1.25rem 0' }}>
              <button 
                type="button" 
                className="btn-text" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ color: 'var(--primary-color)', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                {showAdvanced ? '− Hide' : '+ Show'} Advanced Nutritional Info (Vitamins & Minerals)
              </button>
            </div>

            {showAdvanced && (
              <div className="advanced-fields" style={{ 
                padding: '1.25rem', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '0.75rem', 
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div className="form-row">
                  <div className="form-group third">
                    <label htmlFor="vitaminA">Vit A (mcg)</label>
                    <input type="number" id="vitaminA" step="0.1" value={formData.vitaminA} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="form-group third">
                    <label htmlFor="vitaminC">Vit C (mg)</label>
                    <input type="number" id="vitaminC" step="0.1" value={formData.vitaminC} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="form-group third">
                    <label htmlFor="vitaminD">Vit D (mcg)</label>
                    <input type="number" id="vitaminD" step="0.1" value={formData.vitaminD} onChange={handleChange} placeholder="0" />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: '0.75rem' }}>
                  <div className="form-group half">
                    <label htmlFor="iron">Iron (mg)</label>
                    <input type="number" id="iron" step="0.1" value={formData.iron} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="form-group half">
                    <label htmlFor="calcium">Calcium (mg)</label>
                    <input type="number" id="calcium" step="0.1" value={formData.calcium} onChange={handleChange} placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {formData.id ? 'Update Record' : 'Save Record'}
              </button>
              {formData.id && (
                <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </section>

        <section className="glass-panel list-section">
          <h2>Diet History</h2>
          {sortedRecords.length === 0 ? (
            <div className="empty-state">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              <p>No meals recorded yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Food Name</th>
                    <th>Calories</th>
                    <th>P / C / F (g)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ fontWeight: 500 }}>{record.foodName}</td>
                      <td style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{record.calories}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <div>{record.protein || 0} / {record.carbohydrates || 0} / {record.fat || 0} <span style={{fontSize: '0.7rem'}}>(g)</span></div>
                        {(record.vitaminA || record.vitaminC || record.vitaminD) ? (
                          <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', opacity: 0.8 }}>
                            Vit: {record.vitaminA || 0} / {record.vitaminC || 0} / {record.vitaminD || 0}
                          </div>
                        ) : null}
                      </td>
                      <td className="action-btns">
                        <button type="button" className="icon-btn" onClick={() => editRecord(record)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button type="button" className="icon-btn delete" onClick={() => handleDelete(record.id)} title="Delete">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
