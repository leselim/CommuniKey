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
    guestName: 'Johan Smith',
    vehicle: 'Silver Polo (GP 482 CP)',
    details: 'Valid for guest: Johan Smith (Car: GP 482 CP)',
    time: 'Expires today at 22:00',
    validity: 'Valid today until 22:00',
  },
  {
    id: 'INC-104',
    title: 'Streetlight Repair Request',
    type: 'Maintenance',
    status: 'In Progress',
    details: 'Section A pole #14. City infrastructure dispatched.',
    contractor: 'City Power Dispatch Team',
    time: 'Updated 2h ago',
    repairNotes: 'Technician on site tomorrow at 09:00 for pole replacement.',
  },
  {
    id: 'REQ-88',
    title: 'Gate Remote Access Sync',
    type: 'Access Key',
    status: 'Completed',
    details: 'Secondary remote programmed for Unit 22.',
    time: 'Completed yesterday',
    notes: 'Remote sync code #8841 verified at main gate.',
  },
];

function formatFirstName(user) {
  if (!user) return 'Leseli';

  const nameCandidate = user.first_name || user.firstName || '';
  if (nameCandidate) {
    const raw = nameCandidate.trim();
    if (raw.toLowerCase().startsWith('leseli')) return 'Leseli';
    const spaced = raw.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._-]/g, ' ');
    const firstWord = spaced.split(/\s+/)[0];
    if (firstWord) {
      if (firstWord.toLowerCase().startsWith('leseli')) return 'Leseli';
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }
  }

  if (user.email) {
    const handle = user.email.split('@')[0];
    if (handle.toLowerCase().startsWith('leseli')) return 'Leseli';
    const cleaned = handle.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._-]/g, ' ');
    const firstWord = cleaned.split(/\s+/)[0];
    if (firstWord) {
      if (firstWord.toLowerCase().startsWith('leseli')) return 'Leseli';
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }
  }

  return 'Leseli';
}

function Dashboard() {
  const { userRole, currentUser } = useAuth();

  const [visitorModal, setVisitorModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorVehicle, setVisitorVehicle] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [notice, setNotice] = useState('');

  // Interactive Modals State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpState, setRsvpState] = useState({});

  const announcements = useCollection('/announcements', demoAnnouncements);
  const incidents = useCollection('/incidents', demoIncidents);
  const events = useCollection('/events', demoEvents);

  if (userRole === 'Estate Administrator') {
    return <AdminDashboard />;
  }

  if (userRole === 'Safety Volunteer') {
    return <VolunteerDashboard />;
  }

  if (userRole === 'System Administrator') {
    return <SysAdminDashboard />;
  }

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

  const toggleRsvp = (eventId) => {
    setRsvpState((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
    setNotice(!rsvpState[eventId] ? 'RSVP confirmed! Event added to your calendar.' : 'RSVP updated.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="stack">
      {/* HERO SECTION: Greeting & Quick Actions */}
      <header className="masthead">
        <div>
          <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 600, margin: 0 }}>
            Welcome back, {formatFirstName(currentUser)}
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)', marginTop: 'var(--s2)' }}>
            Riverside Estate • Pretoria
          </p>
        </div>

        <div className="cluster" style={{ gap: 'var(--s3)', alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            style={{ borderColor: 'var(--line-hi)' }}
            onClick={() => setVisitorModal(true)}
          >
            Generate Visitor Pass
          </button>
          <button
            type="button"
            className="btn"
            style={{ borderColor: 'var(--line-hi)' }}
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
            <p className="eyebrow">
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
      <div className="grid-2" style={{ gap: 'var(--s5)' }}>
        {/* Left Column: My Activity & Requests */}
        <section
          className="panel"
          style={{
            padding: 'var(--s5)',
            border: '1px solid var(--line-hi)',
          }}
        >
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                MY ACTIVITY & REQUESTS
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                My Gate Passes & Maintenance Reports
              </h2>
            </div>
          </div>

          <div className="stack" style={{ gap: 'var(--s3)' }}>
            {MY_REQUESTS.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: 'var(--s3) var(--s4)',
                  backgroundColor: 'var(--panel-hi)',
                  border: '1px solid var(--line-hi)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
                onClick={() => setSelectedRequest(req)}
                className="interactive-card"
              >
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                    {req.title} <span className="mono faint">({req.id})</span>
                  </strong>
                  <StatusBadge status={req.status} />
                </div>
                <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                  {req.details}
                </p>
                <div className="cluster" style={{ justifyContent: 'space-between', marginTop: '6px' }}>
                  <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>
                    {req.time}
                  </span>
                  <span className="link sm" style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>
                    View Request →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Upcoming Community Events */}
        <section
          className="panel"
          style={{
            padding: 'var(--s5)',
            border: '1px solid var(--line-hi)',
          }}
        >
          <div
            className="panel-head"
            style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <div>
              <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                COMMUNITY EVENTS
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                Upcoming Gatherings & Meetings
              </h2>
            </div>
            <Link to="/events" className="link" style={{ color: 'var(--dim)', fontWeight: 500, fontSize: '0.8rem' }}>
              View calendar →
            </Link>
          </div>

          <div className="stack" style={{ gap: 'var(--s3)' }}>
            {upcomingEvents.map((evt) => {
              const title = evt.title || evt.event_name;
              const venue = evt.venue || evt.location || evt.event_location;
              const organiser = evt.organiser || 'Safety Committee';
              const statusText = rsvpState[evt.id]
                ? 'Attending'
                : `RSVP Open • ${evt.attendees_count || 14} Attending`;

              return (
                <div
                  key={evt.id}
                  style={{
                    padding: 'var(--s3) var(--s4)',
                    backgroundColor: 'var(--panel-hi)',
                    border: '1px solid var(--line-hi)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedEvent(evt)}
                  className="interactive-card"
                >
                  <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                      {title}
                    </h3>
                    <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {formatDayDate(evt.event_date)}
                    </span>
                  </div>

                  <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                    {venue} • Organised by {organiser}
                  </p>

                  <div className="cluster" style={{ justifyContent: 'space-between', marginTop: '6px' }}>
                    <span
                      className="mono sm"
                      style={{ color: rsvpState[evt.id] ? 'var(--signal)' : 'var(--dim)', fontSize: '0.75rem' }}
                    >
                      {statusText}
                    </span>
                    <span className="link sm" style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* BOTTOM SECTION: Reassuring Community Safety Digest */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">
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

      {/* INTERACTIVE REQUEST DETAILS MODAL */}
      {selectedRequest ? (
        <Modal
          title={`Request Details (${selectedRequest.id})`}
          onClose={() => setSelectedRequest(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setSelectedRequest(null)}>
                Close
              </button>
              {selectedRequest.type === 'Gate Pass' ? (
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => {
                    setNotice(`Gate Pass ${selectedRequest.id} extended for another 24 hours.`);
                    setSelectedRequest(null);
                    setTimeout(() => setNotice(''), 4000);
                  }}
                >
                  Extend Pass
                </button>
              ) : null}
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 'var(--fs-base)', color: 'var(--paper)', margin: 0 }}>
                {selectedRequest.title}
              </h3>
              <StatusBadge status={selectedRequest.status} />
            </div>

            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Details:</strong> {selectedRequest.details}
              </p>
              {selectedRequest.guestName ? (
                <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                  <strong>Guest Name:</strong> {selectedRequest.guestName}
                </p>
              ) : null}
              {selectedRequest.vehicle ? (
                <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                  <strong>Guest Vehicle:</strong> {selectedRequest.vehicle}
                </p>
              ) : null}
              {selectedRequest.contractor ? (
                <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                  <strong>Assigned Contractor:</strong> {selectedRequest.contractor}
                </p>
              ) : null}
              {selectedRequest.repairNotes ? (
                <p className="sm faint" style={{ color: 'var(--paper)' }}>
                  <strong>Repair Notes:</strong> {selectedRequest.repairNotes}
                </p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {/* INTERACTIVE EVENT DETAILS MODAL */}
      {selectedEvent ? (
        <Modal
          title={selectedEvent.title || selectedEvent.event_name}
          onClose={() => setSelectedEvent(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => {
                  toggleRsvp(selectedEvent.id);
                  setSelectedEvent(null);
                }}
              >
                {rsvpState[selectedEvent.id] ? 'Cancel RSVP' : 'Confirm RSVP'}
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <span className="mono sm" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                {formatDayDate(selectedEvent.event_date)} • {selectedEvent.time || '18:30 to 19:30'}
              </span>
              <StatusBadge status={rsvpState[selectedEvent.id] ? 'Attending' : 'RSVP Open'} />
            </div>

            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Venue:</strong> {selectedEvent.venue || selectedEvent.location || selectedEvent.event_location}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Organiser:</strong> {selectedEvent.organiser || 'Safety Committee'}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)', lineHeight: 1.5 }}>
                {selectedEvent.description || 'Join your fellow residents for this estate gathering.'}
              </p>
              <p className="mono sm" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.75rem' }}>
                Attending Residents: {(selectedEvent.attendees_count || 14) + (rsvpState[selectedEvent.id] ? 1 : 0)} Households
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

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
                <label className="eyebrow" htmlFor="v-veh">
                  Vehicle Registration (Optional)
                </label>
                <input
                  id="v-veh"
                  className="control"
                  placeholder="e.g., GP 482 CP"
                  value={visitorVehicle}
                  onChange={(e) => setVisitorVehicle(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-solid">
                Generate 6-Digit Gate Pass
              </button>
            </form>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

export default Dashboard;
