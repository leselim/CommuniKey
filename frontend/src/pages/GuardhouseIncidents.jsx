import React, { useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatClock } from '../utils/format';

const INITIAL_GUARD_INCIDENTS = [
  {
    id: 'sec-101',
    event_type: 'Unauthorized Tailgating Attempt',
    location: 'Main Gate 01 Boom Barrier',
    status: 'Resolved',
    date_reported: new Date(Date.now() - 3600000).toISOString(),
    reported_by: 'Sipho Dlamini (Gate 01 Guard)',
    license_plate: 'GP 992 CP',
    description: 'Silver SUV attempted tailgating behind Unit 14 visitor vehicle. Boom gate auto-dropped sensor. License plate logged: GP 992 CP. Vehicle turned away at gate entrance.',
  },
  {
    id: 'sec-102',
    event_type: 'Expired Pass Access Denied',
    location: 'Main Entrance Guardhouse 01',
    status: 'Resolved',
    date_reported: new Date(Date.now() - 14400000).toISOString(),
    reported_by: 'Sipho Dlamini (Gate 01 Guard)',
    license_plate: 'CA 102 901',
    description: 'Visitor code CK-109 presented 4 hours past expiration time. System denied entry. Resident host notified and visitor requested to turn around.',
  },
  {
    id: 'sec-103',
    event_type: 'Perimeter Sensor Trigger',
    location: 'North Fence Line (Beam 04)',
    status: 'Resolved',
    date_reported: new Date(Date.now() - 28800000).toISOString(),
    reported_by: 'Sarah Jenkins (Safety Patrol)',
    license_plate: 'N/A',
    description: 'Infrared perimeter beam sensor 04 tripped at 02:15. Checked and cleared by Night Patrol Officer Sarah Jenkins. Stray animal confirmed along boundary fence.',
  },
  {
    id: 'sec-104',
    event_type: 'Barrier Gate Override Manual Operation',
    location: 'Main Gate 01 Entrance',
    status: 'Resolved',
    date_reported: new Date(Date.now() - 86400000).toISOString(),
    reported_by: 'Sipho Dlamini (Gate 01 Guard)',
    license_plate: 'EMS Unit 04',
    description: 'Manual key override engaged for emergency medical ambulance dispatch (EMS Unit 4). Resumed automatic barcode scanner control at 03:40.',
  },
];

const EVENT_TYPES = [
  'Unauthorized Tailgating Attempt',
  'Expired Pass Access Denied',
  'Perimeter Sensor Trigger',
  'Barrier Gate Override Manual Operation',
  'Suspicious Vehicle / Loitering',
];

function GuardhouseIncidents() {
  const [incidents, setIncidents] = useState(INITIAL_GUARD_INCIDENTS);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');

  // Form State
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [location, setLocation] = useState('Main Gate 01 Boom Barrier');
  const [licensePlate, setLicensePlate] = useState('');
  const [description, setDescription] = useState('');

  const filteredIncidents = incidents.filter((item) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      item.event_type.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.license_plate.toLowerCase().includes(term)
    );
  });

  const handleCreateLog = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newLog = {
      id: `sec-${Date.now()}`,
      event_type: eventType,
      location: location.trim() || 'Main Gate 01',
      status: 'Resolved',
      date_reported: new Date().toISOString(),
      reported_by: 'Sipho Dlamini (Gate 01 Guard)',
      license_plate: licensePlate.trim().toUpperCase() || 'N/A',
      description: description.trim(),
    };

    setIncidents([newLog, ...incidents]);
    setLogModalOpen(false);
    setDescription('');
    setLicensePlate('');
    setNotice(`Security event "${eventType}" logged into Guardhouse Security Ledger.`);
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      <header className="masthead" style={{ borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s4)' }}>
        <div>
          <p className="eyebrow" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--dim)' }}>
            Station 01 Security & Access Control • Riverside Estate
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 'var(--s1) 0' }}>
            Guardhouse Security & Access Incidents
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)' }}>
            Log and review gate breaches, unauthorized tailgating attempts, and perimeter alerts.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => setLogModalOpen(true)}
            style={{ fontWeight: 600, padding: '0.45rem 0.85rem' }}
          >
            [ + Log Security Event / Gate Breach ]
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
              SECURITY LOG REPOSITORY ({filteredIncidents.length} RECORDS)
            </p>
          </div>
          <input
            type="search"
            className="searchbar"
            placeholder="Search security log by event, plate, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: '320px' }}
          />
        </div>

        <ul className="ledger" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredIncidents.length === 0 ? (
            <li className="blank" style={{ padding: 'var(--s4)', textAlignment: 'center' }}>
              No security events match that query.
            </li>
          ) : (
            filteredIncidents.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: 'var(--s4) 0',
                  borderBottom: '1px solid var(--line-hi)',
                  display: 'block',
                }}
              >
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                  <div className="cluster" style={{ gap: 'var(--s2)', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                      {item.event_type}
                    </h3>
                    <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.75rem' }}>
                      {item.location}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <p style={{ color: 'var(--paper)', fontSize: '0.88rem', margin: '0 0 var(--s2) 0', lineHeight: 1.5 }}>
                  {item.description}
                </p>

                <div className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--dim)' }}>
                  <div>
                    <span>Logged {formatClock(item.date_reported)}</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>Operator: {item.reported_by}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--paper)' }}>Plate: </strong>
                    <span className="mono" style={{ color: 'var(--paper)' }}>{item.license_plate}</span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* LOG SECURITY EVENT MODAL */}
      {logModalOpen ? (
        <Modal
          title="Log Security Event / Gate Breach"
          onClose={() => setLogModalOpen(false)}
          footer={
            <div className="cluster" style={{ justifyContent: 'flex-end', gap: 'var(--s2)' }}>
              <button type="button" className="btn" onClick={() => setLogModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="security-log-form" className="btn btn-solid">
                Record Event Entry
              </button>
            </div>
          }
        >
          <form id="security-log-form" onSubmit={handleCreateLog}>
            <div className="stack" style={{ gap: 'var(--s3)' }}>
              <div className="field">
                <label className="eyebrow" htmlFor="sec-event-type">
                  Security Event Category *
                </label>
                <select
                  id="sec-event-type"
                  className="control"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="sec-loc">
                  Station / Location *
                </label>
                <input
                  id="sec-loc"
                  type="text"
                  className="control"
                  placeholder="e.g. Main Gate 01 Boom Barrier"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="sec-plate">
                  License Plate / Reg Number (Optional)
                </label>
                <input
                  id="sec-plate"
                  type="text"
                  className="control"
                  placeholder="e.g. GP 992 CP"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="sec-desc">
                  Event Incident Details *
                </label>
                <textarea
                  id="sec-desc"
                  className="control"
                  rows={4}
                  placeholder="Provide precise details of breach, gate override, or turned-away vehicle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default GuardhouseIncidents;
