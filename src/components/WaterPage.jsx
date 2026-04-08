import WaterTracker from './WaterTracker';

export default function WaterPage({ user }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Hydration Tracker</h1>
      <div style={{ height: '500px' }}>
        <WaterTracker user={user} />
      </div>
    </div>
  );
}
