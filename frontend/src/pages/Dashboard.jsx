import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import SOSButton from '../components/SOSButton';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import {
  announcements as demoAnnouncements,
  community,
  events as demoEvents,
  incidents as demoIncidents,
} from '../services/demoData';
import { formatDayDate, formatRelative } from '../utils/format';
import AdminDashboard from './AdminDashboard';
import SysAdminDashboard from './SysAdminDashboard';
import VolunteerDashboard from './VolunteerDashboard';

const MY_REQUESTS = [
  {
    id: 'CK-492',
    title: 'Visitor Access Gate Pass',
    type: 'Gate Pass',
    status: 'Active',
    details: 'Valid for guest: Johan Smith (Car: GP 482 CP)',
    time: 'Expires today at 22:00',
  },
  {
    id: 'INC-104',
    title: 'Streetlight Repair Request',
    type: 'Maintenance',
    status: 'In Progress',
    details: 'Section A pole #14. City infrastructure dispatched.',
    time: 'Updated 2h ago',
  },
  {
    id: 'REQ-88',
    title: 'Gate Remote Access Sync',
    type: 'Access Key',
    status: 'Completed',
    details: 'Secondary remote programmed for Unit 22.',
    time: 'Completed yesterday',
  },
];

function Dashboard() {
  const { userRole, currentUser } = useAuth();

  const [visitorModal, setVisitorModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorVehicle, setVisitorVehicle] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [notice, setNotice] = useState('');

  if (userRole === 'Community Administrator') {
    return <AdminDashboard />;
  }

  if (userRole === 'Safety Volunteer') {
    return <VolunteerDashboard />;
  }

  if (userRole === 'System Administrator') {
    return <SysAdminDashboard />;
  }

  const announcements = useCollection('/announcements', demoAnnouncements);
  const incidents = useCollection('/incidents', demoIncidents);
  const events = useCollection('/events', demoEvents);

  const upcomingEvents = events.items
    .filter((item) => new Date(item.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const pinnedAnnouncements = announcements.items.slice(0, 2);

  const handleGenerateVisitorPass = (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    const code = `CK-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedCode(code);
    setNotice(`Visitor Pass ${code} created for ${visitorName}. Code sent to gate guardhouse.`);
  };

  const handleContactGuardhouse = () => {
    setNotice('Direct channel open to Main Gate Guardhouse. Security officer on duty notified.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="stack">
      {/* HERO SECTION: Estate Status & Quick Actions */}
      <header className="masthead">
        <div>
          <div className="cluster" style={{ gap: 'var(--s2)', marginBottom: 'var(--s2)' }}>
            <span
              className="mono sm"
              style={{
                color: 'var(--paper)',
                backgroundColor: 'var(--panel-hi)',
                padding: '0.2rem 0.6rem',
                borderRadius: '3px',
                border: '1px solid var(--line-hi)',
                fontSize: '0.75rem',
              }}
            >
              Riverside Estate • All Gates Operational • 24/7 Patrol Active
            </span>
          </div>
          <h1>Welcome, {currentUser ? currentUser.first_name : 'Resident'}</h1>
          <p className="masthead-meta">
            {community.community_name} • {community.suburb}, {community.city}
          </p>
        </div>

        <div className="cluster" style={{ gap: 'var(--s3)' }}>
          <button
            type="button"
            className="btn"
            style={{ borderColor: 'var(--signal)' }}
            onClick={() => setVisitorModal(true)}
          >
            Generate Visitor Pass
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleContactGuardhouse}
          >
            Contact Guardhouse
          </button>
          <Link to="/incidents" className="btn btn-solid">
            Report Issue / Alert
          </Link>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SOS EMERGENCY ALERT PANEL */}
      <SOSButton />

      {/* TOP SECTION: Active Pinned Estate Broadcasts */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>
              Active Pinned Notices
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Official Estate Broadcasts & Utilities
            </h2>
          </div>
          <Link to="/announcements" className="link">
            All announcements
          </Link>
        </div>

        <div className="stack" style={{ gap: 'var(--s3)' }}>
          {pinnedAnnouncements.map((anc) => (
            <div
              key={anc.id}
              style={{
                padding: 'var(--s4)',
                backgroundColor: 'var(--panel-hi)',
                border: '1px solid var(--line-hi)',
                borderRadius: '4px',
              }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                  {anc.title}
                </h3>
                <span
                  className="mono sm"
                  style={{
                    color: 'var(--signal)',
                    backgroundColor: 'var(--signal-wash)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  {anc.priority === 'high' ? 'High Priority' : 'Notice'}
                </span>
              </div>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                {anc.content}
              </p>
              <p className="mono sm" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.75rem' }}>
                Published {formatRelative(anc.date_published)} by {anc.created_by}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MIDDLE GRID: My Activity (Left) & Upcoming Community Events (Right) */}
      <div className="grid-2">
        {/* Left Column: My Activity & Requests */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow">My Activity & Requests</p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
                My Gate Passes & Maintenance Reports
              </h2>
            </div>
          </div>

          <ul className="ledger">
            {MY_REQUESTS.map((req) => (
              <li className="entry" key={req.id} style={{ display: 'block', padding: 'var(--s3) 0' }}>
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                    {req.title} <span className="mono faint">({req.id})</span>
                  </strong>
                  <StatusBadge status={req.status} />
                </div>
                <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                  {req.details}
                </p>
                <p className="mono sm" style={{ color: 'var(--dim)', marginTop: '4px', fontSize: '0.75rem' }}>
                  {req.time}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Right Column: Upcoming Community Events */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p className="eyebrow">Community Events</p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
                Upcoming Gatherings & Meetings
              </h2>
            </div>
            <Link to="/events" className="link">
              View calendar
            </Link>
          </div>

          <div className="stack" style={{ gap: 'var(--s3)' }}>
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: 'var(--s3) var(--s4)',
                  backgroundColor: 'var(--panel-hi)',
                  border: '1px solid var(--line-hi)',
                  borderRadius: '4px',
                }}
              >
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                    {evt.title}
                  </h3>
                  <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {formatDayDate(evt.event_date)}
                  </span>
                </div>
                <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                  Venue: {evt.location} • Organiser: {evt.organiser}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM SECTION: Reassuring Community Safety Digest */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>
              Estate Safety Digest
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Weekly Community Safety Status
            </h2>
          </div>
        </div>

        <div
          style={{
            padding: 'var(--s4)',
            backgroundColor: 'var(--panel-hi)',
            borderLeft: '3px solid var(--signal)',
            borderTop: '1px solid var(--line-hi)',
            borderRight: '1px solid var(--line-hi)',
            borderBottom: '1px solid var(--line-hi)',
          }}
        >
          <p className="sm" style={{ color: 'var(--paper)', margin: 0, lineHeight: 1.6 }}>
            <strong>5 of 5 community safety reports resolved this week.</strong> All gate access barriers, perimeter fencing sensors, and night patrol routes remain fully operational with zero open security breaches.
          </p>
        </div>
      </section>

      {/* Visitor Pass Generator Modal */}
      {visitorModal ? (
        <Modal
          title="Generate Visitor Access Pass"
          onClose={() => {
            setVisitorModal(false);
            setGeneratedCode('');
          }}
          footer={
            <button
              type="button"
              className="btn"
              onClick={() => {
                setVisitorModal(false);
                setGeneratedCode('');
              }}
            >
              Close
            </button>
          }
        >
          {generatedCode ? (
            <div className="stack" style={{ textAlign: 'center', gap: 'var(--s3)' }}>
              <p className="eyebrow" style={{ color: 'var(--signal)' }}>
                Pass Created Cleanly
              </p>
              <h2 className="mono" style={{ fontSize: '2rem', letterSpacing: '0.1em', color: 'var(--paper)' }}>
                {generatedCode}
              </h2>
              <p className="sm faint">
                Share this 6-digit access code with <strong>{visitorName}</strong>. Sent automatically to Main Gate Guardhouse.
              </p>
            </div>
          ) : (
            <form onSubmit={handleGenerateVisitorPass} className="stack" style={{ gap: 'var(--s4)' }}>
              <div className="field">
                <label className="eyebrow" htmlFor="v-name">
                  Visitor Full Name *
                </label>
                <input
                  id="v-name"
                  className="control"
                  placeholder="e.g., Johan Smith"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="v-vehicle">
                  Visitor Vehicle Reg (Optional)
                </label>
                <input
                  id="v-vehicle"
                  className="control"
                  placeholder="e.g., GP 482 CP"
                  value={visitorVehicle}
                  onChange={(e) => setVisitorVehicle(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-solid" style={{ width: '100%', padding: '0.6rem' }}>
                Generate Access Pass
              </button>
            </form>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

export default Dashboard;
