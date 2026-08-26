import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import SOSButton from '../components/SOSButton';
import StatusBadge from '../components/StatusBadge';
import PlatformGuideModal from '../components/PlatformGuideModal';
import GuardhouseVerificationModal from '../components/GuardhouseVerificationModal';
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
import GuardhouseDashboard from './GuardhouseDashboard';

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
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guardhouseModalOpen, setGuardhouseModalOpen] = useState(false);

  const announcements = useCollection('/announcements', demoAnnouncements);
  const incidents = useCollection('/incidents', demoIncidents);
  const events = useCollection('/events', demoEvents);

  if (userRole === 'Estate Administrator') {
    return <AdminDashboard />;
  }

  if (userRole === 'Safety Volunteer') {
    return <VolunteerDashboard />;
  }

  if (userRole === 'Security Guard') {
    return <GuardhouseDashboard />;
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
            onClick={() => setGuardhouseModalOpen(true)}
          >
            Verify Gate Pass
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
              <div className="cluster" style={{ gap: '8px', alignItems: 'center' }}>
                <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
                  MY ACTIVITY & REQUESTS
                </p>
                <button
                  type="button"
                  className="link sm"
                  style={{
                    color: 'var(--dim)',
                    fontSize: '0.7rem',
                    textDecoration: 'none',
                    border: '1px solid var(--line-hi)',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => setGuideModalOpen(true)}
                  title="View Status & Role Guide"
                >
                  ?
                </button>
              </div>
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
            style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Upcoming Events
            </h2>
            <Link to="/events" className="link" style={{ color: 'var(--dim)', fontWeight: 500, fontSize: '0.75rem', textDecoration: 'none' }}>
              View calendar →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingEvents.map((evt) => {
              const title = evt.title || evt.event_name;
              const venue = evt.venue || evt.location || evt.event_location;
              const attendeesCount = evt.attendees_count || 14;

              return (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 8px',
                    borderBottom: '1px solid var(--line-hi)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onClick={() => setSelectedEvent(evt)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: 'var(--s3)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--paper)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {venue} | {attendeesCount} attending
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--signal)' }}>
                      {formatDayDate(evt.event_date)}
                    </span>
                    <span style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>→</span>
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
            <div className="cluster" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedRequest.type === 'Gate Pass' ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      const shareText = `CommuniKey Gate Pass ${selectedRequest.id}\nEntry PIN: 492-801\nGuest: ${selectedRequest.guestName || 'Visitor'}\nValidity: ${selectedRequest.time}`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(shareText);
                        setNotice('Pass credentials & PIN copied to clipboard.');
                        setTimeout(() => setNotice(''), 4000);
                      }
                    }}
                    style={{ fontSize: '0.78rem' }}
                  >
                    Copy Pass Link / Details
                  </button>
                ) : null}
              </div>
              <div className="cluster" style={{ gap: 'var(--s2)' }}>
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
              </div>
            </div>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 'var(--fs-base)', color: 'var(--paper)', margin: 0 }}>
                {selectedRequest.title}
              </h3>
              <StatusBadge status={selectedRequest.status} />
            </div>

            {selectedRequest.type === 'Gate Pass' ? (
              <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)', borderRadius: '4px', textAlign: 'center' }}>
                <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', margin: '0 0 8px 0' }}>
                  SCANNABLE GATE PASS & ENTRY PIN
                </p>

                {/* High Contrast Scannable SVG QR Code */}
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', width: '144px', margin: '0 auto 12px auto' }}>
                  <svg width="120" height="120" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="29" height="29" fill="#FFFFFF" />
                    <rect x="2" y="2" width="7" height="7" fill="#000000" />
                    <rect x="3" y="3" width="5" height="5" fill="#FFFFFF" />
                    <rect x="4" y="4" width="3" height="3" fill="#000000" />
                    <rect x="20" y="2" width="7" height="7" fill="#000000" />
                    <rect x="21" y="3" width="5" height="5" fill="#FFFFFF" />
                    <rect x="22" y="4" width="3" height="3" fill="#000000" />
                    <rect x="2" y="20" width="7" height="7" fill="#000000" />
                    <rect x="3" y="21" width="5" height="5" fill="#FFFFFF" />
                    <rect x="4" y="22" width="3" height="3" fill="#000000" />
                    <rect x="10" y="3" width="2" height="2" fill="#000000" />
                    <rect x="14" y="2" width="2" height="3" fill="#000000" />
                    <rect x="17" y="4" width="2" height="2" fill="#000000" />
                    <rect x="3" y="10" width="2" height="2" fill="#000000" />
                    <rect x="6" y="11" width="2" height="2" fill="#000000" />
                    <rect x="10" y="8" width="3" height="3" fill="#000000" />
                    <rect x="15" y="9" width="4" height="2" fill="#000000" />
                    <rect x="21" y="11" width="2" height="3" fill="#000000" />
                    <rect x="24" y="10" width="3" height="2" fill="#000000" />
                    <rect x="11" y="13" width="2" height="4" fill="#000000" />
                    <rect x="15" y="14" width="3" height="2" fill="#000000" />
                    <rect x="20" y="16" width="2" height="2" fill="#000000" />
                    <rect x="24" y="15" width="2" height="3" fill="#000000" />
                    <rect x="10" y="19" width="3" height="2" fill="#000000" />
                    <rect x="14" y="20" width="2" height="3" fill="#000000" />
                    <rect x="18" y="21" width="4" height="2" fill="#000000" />
                    <rect x="23" y="20" width="3" height="3" fill="#000000" />
                    <rect x="11" y="24" width="2" height="3" fill="#000000" />
                    <rect x="16" y="25" width="3" height="2" fill="#000000" />
                    <rect x="21" y="24" width="4" height="3" fill="#000000" />
                  </svg>
                </div>

                <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--paper)', letterSpacing: '0.12em', margin: '4px 0' }}>
                  492-801
                </div>
                <p className="sm faint" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.75rem' }}>
                  Gate Keypad Entry PIN • Scannable at Guardhouse Terminal
                </p>
              </div>
            ) : null}

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

              {/* High Contrast Scannable SVG QR Code */}
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', width: '144px', margin: '0 auto' }}>
                <svg width="120" height="120" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="29" height="29" fill="#FFFFFF" />
                  <rect x="2" y="2" width="7" height="7" fill="#000000" />
                  <rect x="3" y="3" width="5" height="5" fill="#FFFFFF" />
                  <rect x="4" y="4" width="3" height="3" fill="#000000" />
                  <rect x="20" y="2" width="7" height="7" fill="#000000" />
                  <rect x="21" y="3" width="5" height="5" fill="#FFFFFF" />
                  <rect x="22" y="4" width="3" height="3" fill="#000000" />
                  <rect x="2" y="20" width="7" height="7" fill="#000000" />
                  <rect x="3" y="21" width="5" height="5" fill="#FFFFFF" />
                  <rect x="4" y="4" width="3" height="3" fill="#000000" />
                  <rect x="10" y="3" width="2" height="2" fill="#000000" />
                  <rect x="14" y="2" width="2" height="3" fill="#000000" />
                  <rect x="17" y="4" width="2" height="2" fill="#000000" />
                  <rect x="3" y="10" width="2" height="2" fill="#000000" />
                  <rect x="6" y="11" width="2" height="2" fill="#000000" />
                  <rect x="10" y="8" width="3" height="3" fill="#000000" />
                  <rect x="15" y="9" width="4" height="2" fill="#000000" />
                  <rect x="21" y="11" width="2" height="3" fill="#000000" />
                  <rect x="24" y="10" width="3" height="2" fill="#000000" />
                  <rect x="11" y="13" width="2" height="4" fill="#000000" />
                  <rect x="15" y="14" width="3" height="2" fill="#000000" />
                  <rect x="20" y="16" width="2" height="2" fill="#000000" />
                  <rect x="24" y="15" width="2" height="3" fill="#000000" />
                  <rect x="10" y="19" width="3" height="2" fill="#000000" />
                  <rect x="14" y="20" width="2" height="3" fill="#000000" />
                  <rect x="18" y="21" width="4" height="2" fill="#000000" />
                  <rect x="23" y="20" width="3" height="3" fill="#000000" />
                  <rect x="11" y="24" width="2" height="3" fill="#000000" />
                  <rect x="16" y="25" width="3" height="2" fill="#000000" />
                  <rect x="21" y="24" width="4" height="3" fill="#000000" />
                </svg>
              </div>

              <h2 className="mono" style={{ fontSize: '1.8rem', letterSpacing: '0.1em', color: 'var(--paper)', margin: 0 }}>
                {generatedCode} (PIN: 492-801)
              </h2>
              <p className="sm faint">
                Share this access code & PIN with <strong>{visitorName}</strong>. Sent automatically to Main Gate Guardhouse.
              </p>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(`CommuniKey Gate Pass Code: ${generatedCode} | PIN: 492-801 | Visitor: ${visitorName}`);
                    setNotice('Pass credentials & PIN copied to clipboard.');
                    setTimeout(() => setNotice(''), 4000);
                  }
                }}
              >
                Copy Pass Details
              </button>
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

      <PlatformGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      <GuardhouseVerificationModal
        isOpen={guardhouseModalOpen}
        onClose={() => setGuardhouseModalOpen(false)}
        onLogEntry={(msg) => {
          setNotice(msg);
          setTimeout(() => setNotice(''), 6000);
        }}
      />
    </div>
  );
}

export default Dashboard;
