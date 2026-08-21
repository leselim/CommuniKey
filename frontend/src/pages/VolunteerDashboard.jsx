import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import {
  community,
  incidents as demoIncidents,
} from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const ACTIVE_EMERGENCY = {
  id: 'sos_991',
  location: '14 Riverside Drive, Section A',
  caller: 'Resident Member',
  time: '3 minutes ago',
  status: 'Dispatched',
  notes: 'SOS Alert triggered from mobile app. Gate patrol and nearest volunteer notified.',
};

const CHECKPOINTS = [
  { id: 1, name: 'Main Security Gate & Access Barrier', status: 'Secured', time: '15m ago' },
  { id: 2, name: 'Riverside Drive North Boundary Wall', status: 'Secured', time: '30m ago' },
  { id: 3, name: 'Section C Back Perimeter Latch', status: 'Checked & Locked', time: '45m ago' },
  { id: 4, name: 'Mill Road Park Entrance Lighting', status: 'Checked', time: '1h ago' },
];

function VolunteerDashboard() {
  const { currentUser } = useAuth();
  const { items: incidentList, update: updateIncident } = useCollection('/incidents', demoIncidents);

  const [emergencyState, setEmergencyState] = useState('Dispatched');
  const [notice, setNotice] = useState('');

  const openIncidents = incidentList.filter((i) => i.status !== 'Resolved');

  const handleResponderAction = (actionName) => {
    setEmergencyState(actionName);
    setNotice(`Responder status updated to ${actionName}. Dispatch team notified.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleIncidentStatus = async (id, status) => {
    await updateIncident(id, { status });
    setNotice(`Safety report status updated to ${status}.`);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="stack">
      {/* SECTION 1: Masthead */}
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            Safety Volunteer & First Responder Hub
          </p>
          <h1>{community.community_name} Emergency Response</h1>
          <p className="masthead-meta">
            Logged in as {currentUser.first_name} {currentUser.last_name} ({currentUser.role})
          </p>
        </div>
        <div className="cluster">
          <Link to="/messages" className="btn btn-solid">
            Open Dispatch Channel
          </Link>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Active SOS Callout Banner */}
      <section
        className="panel"
        style={{
          padding: 'var(--s5)',
          borderLeft: '3px solid var(--signal)',
          borderTop: '1px solid var(--line-hi)',
          borderRight: '1px solid var(--line-hi)',
          borderBottom: '1px solid var(--line-hi)',
          backgroundColor: 'var(--panel-hi)',
        }}
      >
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>
              Active Emergency Alert
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--paper)' }}>
              SOS Triggered at {ACTIVE_EMERGENCY.location}
            </h2>
          </div>
          <span className="mono" style={{ color: 'var(--signal)', fontWeight: 600 }}>
            Status: {emergencyState}
          </span>
        </div>

        <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s4)' }}>
          {ACTIVE_EMERGENCY.notes} Triggered by {ACTIVE_EMERGENCY.caller} ({ACTIVE_EMERGENCY.time}).
        </p>

        <div className="cluster" style={{ gap: 'var(--s3)' }}>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: emergencyState === 'Acknowledged' ? 'var(--signal)' : 'transparent',
              color: 'var(--paper)',
            }}
            onClick={() => handleResponderAction('Acknowledged')}
          >
            Acknowledge Alert
          </button>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: emergencyState === 'En Route' ? 'var(--signal)' : 'transparent',
              color: 'var(--paper)',
            }}
            onClick={() => handleResponderAction('En Route')}
          >
            En Route to Location
          </button>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: emergencyState === 'On Scene' ? 'var(--signal)' : 'transparent',
              color: 'var(--paper)',
            }}
            onClick={() => handleResponderAction('On Scene')}
          >
            On Scene
          </button>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => handleResponderAction('Resolved & Clear')}
          >
            Mark Emergency Clear
          </button>
        </div>
      </section>

      {/* SECTION 3: Responder Figures */}
      <div className="figures">
        <div className="figure">
          <span className="eyebrow">Active SOS Alerts</span>
          <span className="figure-value">1</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Open Safety Concerns</span>
          <span className="figure-value">{openIncidents.length}</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Patrol Rounds Today</span>
          <span className="figure-value">8</span>
        </div>
        <div className="figure">
          <span className="eyebrow">On-Duty Volunteers</span>
          <span className="figure-value">4</span>
        </div>
      </div>

      {/* SECTION 4: Active Incidents & Patrol Action List */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow">Incident Response</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Active Safety Concerns Requiring Attention
            </h2>
          </div>
          <Link to="/incidents" className="link">
            All reports
          </Link>
        </div>

        <ul className="ledger">
          {incidentList.map((item) => (
            <li className="entry" key={item.id} style={{ display: 'block', padding: 'var(--s4) 0' }}>
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                <div>
                  <h3 className="entry-title">{item.incident_type}</h3>
                  <p className="sm faint" style={{ color: 'var(--dim)', marginTop: '2px' }}>
                    Hotspot: <strong>{item.location || 'General Estate'}</strong> • Reported by {item.reported_by}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <p className="entry-body" style={{ color: 'var(--paper)', marginBottom: 'var(--s3)' }}>
                {item.description}
              </p>

              <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="entry-meta">
                  <span>{formatRelative(item.date_reported)}</span>
                  <span>{formatStamp(item.date_reported)}</span>
                </div>

                <div className="cluster" style={{ gap: 'var(--s2)' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleIncidentStatus(item.id, 'Under review')}
                  >
                    Investigating
                  </button>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleIncidentStatus(item.id, 'Resolved')}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 5: Patrol Checkpoints */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Night Patrol</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Perimeter Security Checkpoints
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {CHECKPOINTS.map((cp) => (
            <li className="entry" key={cp.id}>
              <div>
                <h3 className="entry-title">{cp.name}</h3>
                <p className="entry-body" style={{ color: 'var(--dim)' }}>
                  Last inspected {cp.time} by Volunteer Patrol.
                </p>
              </div>
              <span className="entry-aside mono" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                {cp.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default VolunteerDashboard;
