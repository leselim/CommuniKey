import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import DataTable, { CellStack, CellTime } from '../components/DataTable';
import Modal from '../components/Modal';
import SOSButton from '../components/SOSButton';
import StatusBadge from '../components/StatusBadge';
import PlatformGuideModal from '../components/PlatformGuideModal';
import GuardhouseVerificationModal from '../components/GuardhouseVerificationModal';
import { Card, DateBox, Details, EmptyState, MetaItem, SectionBar, Toast } from '../components/ui';
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

const TYPE_LABELS = {
  'Gate Pass': 'Gate pass',
  Maintenance: 'Maintenance',
  'Access Key': 'Access key',
};

/* A fixed pattern standing in for a real encoded pass. Kept high contrast
   on white so a phone camera can read it off the screen. */
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
      <svg width="132" height="132" viewBox="0 0 29 29" aria-label="Gate pass code" role="img">
        <rect width="29" height="29" fill="#ffffff" />
        {QR_CELLS.map((cell, i) => (
          <rect key={i} x={cell[0]} y={cell[1]} width={cell[2]} height={cell[3]} fill={cell[4] ? '#ffffff' : '#17191e'} />
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

function ActionTile({ icon, title, text, onClick, to }) {
  const body = (
    <>
      <span className="action-tile-icon">
        <Icon name={icon} />
      </span>
      <span className="action-tile-text">
        <strong>{title}</strong>
        <span>{text}</span>
      </span>
      <Icon name="chevronRight" />
    </>
  );
  if (to) {
    return (
      <Link to={to} className="action-tile">
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className="action-tile" onClick={onClick}>
      {body}
    </button>
  );
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
  const activePasses = MY_REQUESTS.filter((r) => r.type === 'Gate Pass' && r.status === 'Active').length;
  const openRequests = MY_REQUESTS.filter((r) => r.status !== 'Completed').length;

  const flash = (message, ms = 4000) => {
    setNotice(message);
    setTimeout(() => setNotice((current) => (current === message ? '' : current)), ms);
  };

  const handleGenerateVisitorPass = (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    const code = `CK-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedCode(code);
    flash(`Pass ${code} created for ${visitorName}. The guardhouse has been notified.`);
  };

  const closeVisitorModal = () => {
    setVisitorModal(false);
    setGeneratedCode('');
    setVisitorName('');
    setVisitorVehicle('');
  };

  const handleContactGuardhouse = () => {
    flash('The officer on duty at the main gate has been notified.');
  };

  const toggleRsvp = (eventId) => {
    const next = !rsvpState[eventId];
    setRsvpState((prev) => ({ ...prev, [eventId]: next }));
    flash(next ? 'You are on the attendance list.' : 'You have been removed from the list.');
  };

  return (
    <div className="page">
      <SOSButton />

      <SectionBar
        icon="home"
        title={`Good to see you, ${firstNameOf(currentUser)}`}
        stats={[
          { label: 'Active passes:', value: activePasses },
          { label: 'Open requests:', value: openRequests },
          { label: 'Upcoming events:', value: upcomingEvents.length },
          { label: 'Notices:', value: announcements.items.length },
        ]}
      />

      <div className="grid grid-4">
        <ActionTile icon="ticket" title="Visitor pass" text="Create a pass for a guest" onClick={() => setVisitorModal(true)} />
        <ActionTile icon="key" title="Verify a pass" text="Check a code before entry" onClick={() => setGuardhouseModalOpen(true)} />
        <ActionTile icon="phone" title="Call the gate" text="Notify the officer on duty" onClick={handleContactGuardhouse} />
        <ActionTile icon="alert" title="Report something" text="Log an incident with security" to="/incidents" />
      </div>

      <div className="grid grid-3">
        <Card
          className="span-2"
          title="Notices from management"
          sub={`${community.community_name} estate office`}
          flush
          ruled
          actions={
            <Link to="/announcements" className="link">
              All notices
              <Icon name="chevronRight" />
            </Link>
          }
        >
          {pinnedAnnouncements.length === 0 ? (
            <EmptyState icon="megaphone" title="Nothing posted yet" text="Notices from estate management will appear here." />
          ) : (
            pinnedAnnouncements.map((anc) => (
              <div className="list-row" key={anc.id} style={{ alignItems: 'flex-start' }}>
                <span className="list-main">
                  <span className="list-title">{anc.title}</span>
                  <span className="list-text">{anc.content}</span>
                  <span className="list-meta" style={{ '--meta-col': '120px' }}>
                    <MetaItem icon="clock">{formatRelative(anc.date_published)}</MetaItem>
                    <MetaItem icon="user">{anc.created_by}</MetaItem>
                  </span>
                </span>
                <span className="list-end" style={{ '--end-col': '90px' }}>
                  {anc.priority === 'high' ? <StatusBadge status="High priority" /> : null}
                </span>
              </div>
            ))
          )}
        </Card>

        <Card
          title="Coming up"
          sub="Events you can attend"
          flush
          ruled
          actions={
            <Link to="/events" className="link">
              Calendar
              <Icon name="chevronRight" />
            </Link>
          }
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState icon="calendar" title="No events scheduled" />
          ) : (
            upcomingEvents.map((evt) => {
              const title = evt.title || evt.event_name;
              const venue = evt.venue || evt.location || evt.event_location;
              const attending = evt.attendees_count || 14;
              return (
                <button type="button" className="list-row" key={evt.id} onClick={() => setSelectedEvent(evt)}>
                  <DateBox value={evt.event_date} />
                  <span className="list-main">
                    <span className="list-title">{title}</span>
                    <span className="list-meta" style={{ marginTop: 2, '--meta-col': '150px' }}>
                      <MetaItem icon="mapPin">{venue}</MetaItem>
                      <MetaItem icon="users">{attending} attending</MetaItem>
                    </span>
                  </span>
                  <span className="list-end">
                    {rsvpState[evt.id] ? <span className="pill pill-plain">Going</span> : null}
                    <Icon name="chevronRight" />
                  </span>
                </button>
              );
            })
          )}
        </Card>
      </div>

      <Card
        title="Your requests"
        sub="Passes, repairs and access changes linked to your address"
        flush
        actions={
          <button type="button" className="link" onClick={() => setGuideModalOpen(true)}>
            What do these statuses mean?
          </button>
        }
      >
        <DataTable
          caption="Your requests"
          columns={[
            { key: 'ref', header: 'Reference', width: '110px', nowrap: true, cell: (r) => <span className="code">{r.id}</span> },
            {
              key: 'request',
              header: 'Request',
              stack: true,
              cell: (r) => (
                <CellStack
                  title={
                    <button
                      type="button"
                      className="row-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(r);
                      }}
                    >
                      {r.title}
                    </button>
                  }
                  sub={r.details}
                />
              ),
            },
            { key: 'type', header: 'Type', width: '130px', cell: (r) => TYPE_LABELS[r.type] || r.type },
            { key: 'update', header: 'Last update', width: '190px', cell: (r) => <CellTime>{r.time}</CellTime> },
            { key: 'status', header: 'Status', width: '130px', cell: (r) => <StatusBadge status={r.status} /> },
            {
              key: 'go',
              header: null,
              srHeader: 'Open request',
              align: 'end',
              width: '44px',
              cell: () => <Icon name="chevronRight" className="muted" />,
            },
          ]}
          rows={MY_REQUESTS}
          onRowClick={setSelectedRequest}
          rowLabel={(r) => `Open ${r.title}`}
        />
      </Card>

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
          <div className="spread" style={{ marginBottom: 14 }}>
            <span className="code">{selectedRequest.id}</span>
            <StatusBadge status={selectedRequest.status} />
          </div>

          {selectedRequest.type === 'Gate Pass' ? (
            <div className="pass" style={{ marginBottom: 14 }}>
              <PassCode />
              <span className="pass-pin">{selectedRequest.pin}</span>
              <span className="hint">Show this at the gate, or type the number into the keypad.</span>
            </div>
          ) : null}

          <Details
            rows={[
              { label: 'Detail', value: selectedRequest.details },
              selectedRequest.guestName ? { label: 'Guest', value: selectedRequest.guestName } : null,
              selectedRequest.vehicle ? { label: 'Vehicle', value: selectedRequest.vehicle } : null,
              selectedRequest.contractor ? { label: 'Assigned to', value: selectedRequest.contractor } : null,
              selectedRequest.repairNotes ? { label: 'Latest note', value: selectedRequest.repairNotes } : null,
              selectedRequest.notes ? { label: 'Note', value: selectedRequest.notes } : null,
              { label: 'Updated', value: selectedRequest.time },
            ]}
          />
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
                className={rsvpState[selectedEvent.id] ? 'btn' : 'btn btn-primary'}
                onClick={() => toggleRsvp(selectedEvent.id)}
              >
                {rsvpState[selectedEvent.id] ? 'Cancel my place' : 'Count me in'}
              </button>
            </>
          }
        >
          <Details
            rows={[
              { label: 'When', value: formatDayDate(selectedEvent.event_date) },
              {
                label: 'Where',
                value: selectedEvent.venue || selectedEvent.location || selectedEvent.event_location,
              },
              { label: 'Attending', value: selectedEvent.attendees_count || 14 },
              rsvpState[selectedEvent.id] ? { label: 'Your place', value: 'You are on the attendance list' } : null,
            ]}
          />
          {selectedEvent.description ? (
            <p className="ink-2" style={{ marginTop: 12 }}>
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
              <button type="button" className="btn btn-primary" onClick={closeVisitorModal}>
                Done
              </button>
            ) : (
              <>
                <button type="button" className="btn" onClick={closeVisitorModal}>
                  Cancel
                </button>
                <button type="submit" form="visitor-form" className="btn btn-primary">
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
              <span className="hint">Sent to {visitorName}. The guardhouse can see it immediately.</span>
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
                  data-autofocus
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
        onLogEntry={(msg) => flash(msg, 6000)}
      />

      <Toast message={notice} />
    </div>
  );
}

export default Dashboard;
