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
import VolunteerDashboard from './VolunteerDashboard';
import GuardhouseDashboard from './GuardhouseDashboard';

const MY_REQUESTS = [
  {
    id: 'CK-492',
    title: 'Visitor gate pass',
    type: 'Gate Pass',
    status: 'Active',
    guestName: 'Johan Smith',
    vehicle: 'Silver Polo (GP 482 CP)',
    details: 'Valid for one guest arriving at the main gate.',
    time: 'Expires today at 22:00',
    pin: '492-801',
  },
  {
    id: 'INC-104',
    title: 'Streetlight repair',
    type: 'Maintenance',
    status: 'In Progress',
    details: 'Section A, pole 14. City infrastructure has been dispatched.',
    contractor: 'City Power dispatch team',
    time: 'Updated 2 hours ago',
    repairNotes: 'Technician on site tomorrow at 09:00 to replace the pole.',
  },
  {
    id: 'REQ-88',
    title: 'Gate remote sync',
    type: 'Access Key',
    status: 'Completed',
    details: 'Secondary remote programmed for unit 22.',
    time: 'Completed yesterday',
    notes: 'Remote sync code 8841 verified at the main gate.',
  },
];

/* A fixed pattern standing in for a real encoded pass. Kept high-contrast
   on white so a phone camera can actually read it off the screen. */
const QR_CELLS = [
  [2, 2, 7, 7], [3, 3, 5, 5, true], [4, 4, 3, 3],
  [20, 2, 7, 7], [21, 3, 5, 5, true], [22, 4, 3, 3],
  [2, 20, 7, 7], [3, 21, 5, 5, true], [4, 22, 3, 3],
  [10, 3, 2, 2], [14, 2, 2, 3], [17, 4, 2, 2],
  [3, 10, 2, 2], [6, 11, 2, 2], [10, 8, 3, 3],
  [15, 9, 4, 2], [21, 11, 2, 3], [24, 10, 3, 2],
  [11, 13, 2, 4], [15, 14, 3, 2], [20, 16, 2, 2],
  [24, 15, 2, 3], [10, 19, 3, 2], [14, 20, 2, 3],
  [18, 21, 4, 2], [23, 20, 3, 3], [11, 24, 2, 3],
  [16, 25, 3, 2], [21, 24, 4, 3],
];

function PassCode() {
  return (
    <span className="pass-code">
      <svg width="120" height="120" viewBox="0 0 29 29" aria-label="Gate pass code" role="img">
        <rect width="29" height="29" fill="#ffffff" />
        {QR_CELLS.map((cell, i) => (
          <rect
            key={i}
            x={cell[0]}
            y={cell[1]}
            width={cell[2]}
            height={cell[3]}
            fill={cell[4] ? '#ffffff' : '#000000'}
          />
        ))}
      </svg>
    </span>
  );
}

function firstNameOf(user) {
  if (!user) return 'there';
  const raw = (user.first_name || user.firstName || '').trim();
  if (raw) return raw.split(/\s+/)[0];
  if (user.email) {
    const handle = user.email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    const word = handle.split(/\s+/)[0];
    if (word) return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return 'there';
}

function Dashboard() {
  const { userRole, currentUser } = useAuth();

  const [visitorModal, setVisitorModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorVehicle, setVisitorVehicle] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [notice, setNotice] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpState, setRsvpState] = useState({});
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guardhouseModalOpen, setGuardhouseModalOpen] = useState(false);

  const announcements = useCollection('/announcements', demoAnnouncements);
  useCollection('/incidents', demoIncidents);
  const events = useCollection('/events', demoEvents);

  if (userRole === 'Estate Administrator') return <AdminDashboard />;
  if (userRole === 'Safety Volunteer') return <VolunteerDashboard />;
  if (userRole === 'Security Guard') return <GuardhouseDashboard />;

  const upcomingEvents = events.items
    .filter((item) => new Date(item.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const pinnedAnnouncements = announcements.items.slice(0, 2);

  const handleGenerateVisitorPass = (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    const code = `CK-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedCode(code);
    setNotice(`Pass ${code} created for ${visitorName}. The guardhouse has been notified.`);
  };

  const closeVisitorModal = () => {
    setVisitorModal(false);
    setGeneratedCode('');
    setVisitorName('');
    setVisitorVehicle('');
  };

  const handleContactGuardhouse = () => {
    setNotice('The officer on duty at the main gate has been notified.');
    setTimeout(() => setNotice(''), 4000);
  };

  const toggleRsvp = (eventId) => {
    const next = !rsvpState[eventId];
    setRsvpState((prev) => ({ ...prev, [eventId]: next }));
    setNotice(next ? 'You are on the attendance list.' : 'You have been removed from the list.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s6)' }}>
      <header className="masthead">
        <div>
          <p className="eyebrow">
            {community.community_name} · {community.city}
          </p>
          <h1>Good to see you, {firstNameOf(currentUser)}</h1>
          <p className="masthead-meta">
            Everything happening at your address, and the gate tools you can use right now.
          </p>
        </div>

        <div className="cluster" style={{ gap: 'var(--s2)' }}>
          <button type="button" className="btn" onClick={() => setVisitorModal(true)}>
            Visitor pass
          </button>
          <button type="button" className="btn" onClick={() => setGuardhouseModalOpen(true)}>
            Verify a pass
          </button>
          <button type="button" className="btn" onClick={handleContactGuardhouse}>
            Call the gate
          </button>
          <Link to="/incidents" className="btn btn-solid">
            Report something
          </Link>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      <SOSButton />

      <section className="section">
        <div className="section-head">
          <h2>Notices from management</h2>
          <Link to="/announcements" className="link">
            All notices
          </Link>
        </div>

        {pinnedAnnouncements.length === 0 ? (
          <p className="blank">Nothing has been posted yet.</p>
        ) : (
          <div>
            {pinnedAnnouncements.map((anc) => (
              <article
                className={`note-card${anc.priority === 'high' ? ' note-card-high' : ''}`}
                key={anc.id}
              >
                <div className="note-head">
                  <h3>{anc.title}</h3>
                  {anc.priority === 'high' ? (
                    <StatusBadge status="High priority" />
                  ) : null}
                </div>
                <p className="note-body">{anc.content}</p>
                <p className="note-foot">
                  {formatRelative(anc.date_published)} · {anc.created_by}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid-2">
        <section className="section">
          <div className="section-head">
            <h2>Your requests</h2>
            <button type="button" className="link" onClick={() => setGuideModalOpen(true)}>
              What do these mean?
            </button>
          </div>

          <div className="row-list">
            {MY_REQUESTS.map((req) => (
              <button
                type="button"
                className="row-item"
                key={req.id}
                onClick={() => setSelectedRequest(req)}
              >
                <span className="row-main">
                  <span className="row-title">{req.title}</span>
                  <span className="row-meta">
                    {req.id} · {req.time}
                  </span>
                </span>
                <span className="row-end">
                  <StatusBadge status={req.status} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>What is coming up</h2>
            <Link to="/events" className="link">
              Full calendar
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="blank">No events are scheduled.</p>
          ) : (
            <div className="row-list">
              {upcomingEvents.map((evt) => {
                const title = evt.title || evt.event_name;
                const venue = evt.venue || evt.location || evt.event_location;
                const attending = evt.attendees_count || 14;

                return (
                  <button
                    type="button"
                    className="row-item"
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <span className="row-main">
                      <span className="row-title">{title}</span>
                      <span className="row-meta">
                        {venue} · {attending} attending
                      </span>
                    </span>
                    <span className="row-end">
                      <span className="row-date">{formatDayDate(evt.event_date)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {selectedRequest ? (
        <Modal
          title={selectedRequest.title}
          onClose={() => setSelectedRequest(null)}
          footer={
            <button type="button" className="btn" onClick={() => setSelectedRequest(null)}>
              Close
            </button>
          }
        >
          <div className="spread" style={{ marginBottom: 'var(--s4)' }}>
            <span className="mono">{selectedRequest.id}</span>
            <StatusBadge status={selectedRequest.status} />
          </div>

          {selectedRequest.type === 'Gate Pass' ? (
            <div className="pass">
              <PassCode />
              <span className="pass-pin">{selectedRequest.pin}</span>
              <span className="hint">
                Show this at the gate, or type the number into the keypad.
              </span>
            </div>
          ) : null}

          <div className="details" style={{ marginTop: 'var(--s4)' }}>
            <div className="details-row">
              <span className="details-label">Detail</span>
              <span className="details-value">{selectedRequest.details}</span>
            </div>
            {selectedRequest.guestName ? (
              <div className="details-row">
                <span className="details-label">Guest</span>
                <span className="details-value">{selectedRequest.guestName}</span>
              </div>
            ) : null}
            {selectedRequest.vehicle ? (
              <div className="details-row">
                <span className="details-label">Vehicle</span>
                <span className="details-value">{selectedRequest.vehicle}</span>
              </div>
            ) : null}
            {selectedRequest.contractor ? (
              <div className="details-row">
                <span className="details-label">Assigned to</span>
                <span className="details-value">{selectedRequest.contractor}</span>
              </div>
            ) : null}
            {selectedRequest.repairNotes ? (
              <div className="details-row">
                <span className="details-label">Latest note</span>
                <span className="details-value">{selectedRequest.repairNotes}</span>
              </div>
            ) : null}
            {selectedRequest.notes ? (
              <div className="details-row">
                <span className="details-label">Note</span>
                <span className="details-value">{selectedRequest.notes}</span>
              </div>
            ) : null}
            <div className="details-row">
              <span className="details-label">Updated</span>
              <span className="details-value">{selectedRequest.time}</span>
            </div>
          </div>
        </Modal>
      ) : null}

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
                className={rsvpState[selectedEvent.id] ? 'btn' : 'btn btn-solid'}
                onClick={() => toggleRsvp(selectedEvent.id)}
              >
                {rsvpState[selectedEvent.id] ? 'Cancel my place' : 'Count me in'}
              </button>
            </>
          }
        >
          <div className="details">
            <div className="details-row">
              <span className="details-label">When</span>
              <span className="details-value">{formatDayDate(selectedEvent.event_date)}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Where</span>
              <span className="details-value">
                {selectedEvent.venue || selectedEvent.location || selectedEvent.event_location}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Attending</span>
              <span className="details-value nums">{selectedEvent.attendees_count || 14}</span>
            </div>
          </div>
          {selectedEvent.description ? (
            <p className="sm dim" style={{ marginTop: 'var(--s4)' }}>
              {selectedEvent.description}
            </p>
          ) : null}
        </Modal>
      ) : null}

      {visitorModal ? (
        <Modal
          title="Visitor pass"
          onClose={closeVisitorModal}
          footer={
            generatedCode ? (
              <button type="button" className="btn btn-solid" onClick={closeVisitorModal}>
                Done
              </button>
            ) : (
              <>
                <button type="button" className="btn" onClick={closeVisitorModal}>
                  Cancel
                </button>
                <button type="submit" form="visitor-form" className="btn btn-solid">
                  Create pass
                </button>
              </>
            )
          }
        >
          {generatedCode ? (
            <div className="pass">
              <PassCode />
              <span className="pass-pin">{generatedCode}</span>
              <span className="hint">
                Sent to {visitorName}. The guardhouse can see it immediately.
              </span>
            </div>
          ) : (
            <form id="visitor-form" onSubmit={handleGenerateVisitorPass} className="fields">
              <div className="field field-wide">
                <label htmlFor="visitor-name">Visitor name</label>
                <input
                  id="visitor-name"
                  className="control"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Johan Smith"
                  required
                />
              </div>
              <div className="field field-wide">
                <label htmlFor="visitor-vehicle">Vehicle and registration</label>
                <input
                  id="visitor-vehicle"
                  className="control"
                  value={visitorVehicle}
                  onChange={(e) => setVisitorVehicle(e.target.value)}
                  placeholder="Silver Polo, GP 482 CP"
                />
                <span className="hint">Optional, but it speeds up entry at the boom.</span>
              </div>
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
