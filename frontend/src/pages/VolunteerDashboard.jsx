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

const VOLUNTEER_TEAM = [
  { id: 1, name: 'Sarah Jenkins', role: 'Team Lead / Section B Patrol', status: 'On Shift', phone: '+27 83 456 7890' },
  { id: 2, name: 'Sipho Dlamini', role: 'Main Gate Patrol Officer', status: 'On Shift', phone: '+27 82 555 1212' },
  { id: 3, name: 'Johan Venter', role: 'Perimeter Night Watch', status: 'On Standby', phone: '+27 84 999 3333' },
];

const PATROL_ROUTES = [
  { id: 1, route: 'Section A & Riverside Drive Perimeter', status: 'Completed', time: '20m ago' },
  { id: 2, route: 'Section B & Mill Road Park Entrance', status: 'In Progress', time: 'Active now' },
  { id: 3, route: 'Section C Back Fence & Access Latch', status: 'Scheduled', time: 'Next at 23:00' },
];

function VolunteerDashboard() {
  const { currentUser } = useAuth();
  const { items: incidentList, update: updateIncident } = useCollection('/incidents', demoIncidents);

  const [emergencyState, setEmergencyState] = useState('Dispatched');
  const [notice, setNotice] = useState('');

  const handleResponderAction = (actionName) => {
    setEmergencyState(actionName);
    setNotice(`Responder status updated to ${actionName}. Security dispatch notified.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleIncidentStatus = async (id, status) => {
    await updateIncident(id, { status });
    setNotice(`Safety incident status updated to ${status}.`);
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
          <h1>Emergency Dispatch & Patrol Triage</h1>
          <p className="masthead-meta">
            Logged in as {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Safety Volunteer'} ({community.community_name})
          </p>
        </div>
        <div className="cluster">
          <Link to="/messages" className="btn btn-solid">
            Open Dispatch Channel
          </Link>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Live Emergency Triage Banner */}
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
              Live Emergency Triage Queue
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--paper)' }}>
              SOS Triggered at 14 Riverside Drive, Section A
            </h2>
          </div>
          <span className="mono sm" style={{ color: 'var(--signal)', fontWeight: 600 }}>
            Triage Status: {emergencyState}
          </span>
        </div>

        <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s4)' }}>
          SOS Alert triggered from resident app. Patrol officer Sipho Dlamini notified.
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
            Mark Incident Resolved
          </button>
        </div>
      </section>

      {/* SECTION 3: Live Incident Triage Feed */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow">Triage Feed</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Incoming Incident Reports Requiring Dispatch
            </h2>
          </div>
          <Link to="/incidents" className="link">
            Full incident ledger
          </Link>
        </div>

        <ul className="ledger">
          {incidentList.map((item) => (
            <li className="entry" key={item.id} style={{ display: 'block', padding: 'var(--s4) 0' }}>
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                <div>
                  <h3 className="entry-title">{item.incident_type}</h3>
                  <p className="sm faint" style={{ color: 'var(--dim)', marginTop: '2px' }}>
                    Location: <strong>{item.location || 'General Estate'}</strong> • Reported by {item.reported_by}
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
                    Set Under Review
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

      {/* SECTION 4: Patrol Coordination Grid */}
      <div className="grid-2">
        {/* Patrol Routes */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow">Patrol Coordination</p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
                Active Patrol Routes & Check-Ins
              </h2>
            </div>
          </div>

          <ul className="ledger">
            {PATROL_ROUTES.map((p) => (
              <li className="entry" key={p.id}>
                <div>
                  <h3 className="entry-title">{p.route}</h3>
                  <p className="entry-body" style={{ color: 'var(--dim)' }}>
                    Check-in: {p.time}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </section>

        {/* Safety Volunteer Roster */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow">Volunteer Roster</p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
                On-Duty Responders & Contacts
              </h2>
            </div>
          </div>

          <ul className="ledger">
            {VOLUNTEER_TEAM.map((v) => (
              <li className="entry" key={v.id}>
                <div>
                  <h3 className="entry-title">{v.name}</h3>
                  <p className="entry-body">{v.role}</p>
                  <a
                    href={`tel:${v.phone.replace(/[^0-9+]/g, '')}`}
                    className="link sm"
                    style={{ color: 'var(--dim)', fontSize: '0.75rem', display: 'inline-block', marginTop: '4px' }}
                  >
                    Contact: {v.phone}
                  </a>
                </div>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
