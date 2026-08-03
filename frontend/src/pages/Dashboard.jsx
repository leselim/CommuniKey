import React from 'react';
import SOSButton from '../components/SOSButton';

function Dashboard() {
  return (
    <div>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <h2>Community Security & Emergency Response</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>
          In case of immediate danger or distress, trigger the emergency distress signal below.
        </p>
        <SOSButton />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3>📢 Latest Announcements</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            Neighbourhood Watch General Meeting scheduled for Saturday at 10:00 AM.
          </p>
        </div>

        <div className="card">
          <h3>⚠️ Recent Incidents</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            No active emergency incidents reported in your section today.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
