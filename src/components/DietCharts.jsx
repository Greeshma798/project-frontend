import { Pie, Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { useEffect, useState } from 'react';
import { getDietRecords } from '../services/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function DietCharts({ user }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getDietRecords(user.id).then(res => setRecords(res.data));
  }, [user]);

 
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === today);

  const macros = todayRecords.reduce((acc, r) => ({
    protein: acc.protein + (r.protein || 0),
    carbs: acc.carbs + (r.carbohydrates || 0),
    fat: acc.fat + (r.fat || 0)
  }), { protein: 0, carbs: 0, fat: 0 });

  const pieData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [macros.protein, macros.carbs, macros.fat],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };


  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const calorieData = {
    labels: last7Days.map(d => d.split('-').slice(1).reverse().join('/')),
    datasets: [{
      label: 'Calories',
      data: last7Days.map(date => {
        return records
          .filter(r => r.date === date)
          .reduce((sum, r) => sum + r.calories, 0);
      }),
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const micronutrients = todayRecords.reduce((acc, r) => ({
    vitaminA: acc.vitaminA + (r.vitaminA || 0),
    vitaminC: acc.vitaminC + (r.vitaminC || 0),
    vitaminD: acc.vitaminD + (r.vitaminD || 0),
    iron: acc.iron + (r.iron || 0),
    calcium: acc.calcium + (r.calcium || 0)
  }), { vitaminA: 0, vitaminC: 0, vitaminD: 0, iron: 0, calcium: 0 });

  const microChartData = {
    labels: ['Vit A', 'Vit C', 'Vit D', 'Iron', 'Calcium'],
    datasets: [{
      label: 'Today\'s Intake (%)',
      
      data: [
        (micronutrients.vitaminA / 800) * 100, 
        (micronutrients.vitaminC / 80) * 100, 
        (micronutrients.vitaminD / 15) * 100,
        (micronutrients.iron / 13) * 100,
        (micronutrients.calcium / 1000) * 100
      ],
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Macro Breakdown (Today)</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            {todayRecords.length > 0 ? (
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>No records for today</p>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Calories (Last 7 Days)</h3>
          <div style={{ height: '300px' }}>
            <Bar
              data={calorieData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>Micronutrient Progress (Today)</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Your intake of essential vitamins and minerals as a percentage of daily targets.
        </p>
        <div style={{ height: '250px' }}>
          <Bar
            data={microChartData}
            options={{
              indexAxis: 'y',
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { 
                x: { 
                  beginAtZero: true, 
                  max: 120,
                  ticks: { callback: (value) => value + '%' }
                } 
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
