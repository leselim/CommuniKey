import React, { useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const INITIAL_GUARD_LOGS = [
  {
    id: 'g-log-1',
    title: 'Tailgating Attempt Flagged',
    category: 'Gate Breaches',
    location: 'Main Boom Gate 01',
    vehicle: 'Unregistered Silver Sedan',
    outcome: 'Flagged & Intercepted',
    timestamp: '20 mins ago',
    details: 'Main Boom Gate 01 • Vehicle: Unregistered Silver Sedan',
    reportedBy: 'Sipho Dlamini (Gate 01 Guard)',
  },
  {
    id: 'g-log-2',
    title: 'Expired Pass Rejected',
    category: 'Access Denied',
    location: 'Terminal 01',
    code: '771-304',
    host: 'Unit 08',
    outcome: 'Turned Away',
    timestamp: '1 hour ago',
    details: 'Visitor code 771-304 rejected at Terminal 01 • Host: Unit 08',
    reportedBy: 'Sipho Dlamini (Gate 01 Guard)',
  },
  {
    id: 'g-log-3',
    title: 'Manual Override Logged',
    category: 'Access Denied',
    pass: '492-801',
    authorizer: 'Admin Marcus',
    outcome: 'Approved',
    timestamp: '2 hours ago',
    details: 'Resident pass 492-801 manually authorized by Admin Marcus',
    reportedBy: 'Marcus Vance (Estate Administrator)',
  },
  {
    id: 'g-log-4',
    title: 'Perimeter Sensor Trigger',
    category: 'Perimeter',
    location: 'Sector 4 East Fence',
    inspector: 'Patrol Volunteer Sarah',
    outcome: 'Cleared / False Alarm',
    timestamp: 'Yesterday',
    details: 'Sector 4 East Fence • Inspected by Patrol Volunteer Sarah',
    reportedBy: 'Sarah Jenkins (Safety Volunteer)',
  },
];

const FILTER_TABS = ['All Events', 'Gate Breaches', 'Access Denied', 'Perimeter'];

const EVENT_TYPES = [
  'Tailgating',
  'Invalid Access Attempt',
  'Physical Barrier Issue',
  'Suspicious Vehicle',
];

function GuardhouseIncidents() {
  const [logs, setLogs] = useState(INITIAL_GUARD_LOGS);
  const [activeTab, setActiveTab] = useState('All Events');
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Form State
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [locationInput, setLocationInput] = useState('Main Boom Gate 01');
  const [plateInput, setPlateInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const countByTab = (tab) => {
    if (tab === 'All Events') return logs.length;
    return logs.filter((l) => l.category === tab).length;
  };

  const filteredLogs = logs.filter((l) => {
    if (activeTab === 'All Events') return true;
    return l.category === activeTab;
  });

  const handleSubmitLog = (e) => {
    e.preventDefault();
    if (!notesInput.trim()) return;

    let category = 'Access Denied';
    if (eventType === 'Tailgating') category = 'Gate Breaches';
    if (eventType === 'Physical Barrier Issue') category = 'Perimeter';

    const newEntry = {
      id: `g-log-${Date.now()}`,
      title: `${eventType} Event Logged`,
      category: category,
      location: locationInput.trim() || 'Main Gate 01',
      vehicle: plateInput.trim() ? plateInput.trim().toUpperCase() : 'N/A',
      outcome: 'Flagged & Under Review',
      timestamp: 'Just now',
      details: `${locationInput.trim()} • ${notesInput.trim()}${plateInput ? ` • Plate: ${plateInput.trim().toUpperCase()}` : ''}`,
      reportedBy: 'Sipho Dlamini (Gate 01 Guard)',
    };

    setLogs([newEntry, ...logs]);
    setModalOpen(false);
    setNotesInput('');
    setPlateInput('');
    setNotice(`Security event "${eventType}" submitted successfully.`);
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* HEADER */}
      <header className="masthead" style={{ borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s4)' }}>
        <div>
          <p className="eyebrow" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--dim)', margin: '0 0 var(--s1) 0' }}>
            Station 01 — Security Ops • Riverside Estate
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 0 }}>
            Guardhouse Incident & Gate Breach Log
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)', marginTop: 'var(--s1)' }}>
            Review security events, access denials, and perimeter flags for Main Gate 01.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => setModalOpen(true)}
            style={{ fontWeight: 600, padding: '0.45rem 0.85rem' }}
          >
            [ + Log Security Event ]
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* FILTER TABS */}
      <div className="cluster" style={{ gap: 'var(--s2)', borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s2)' }}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = countByTab(tab);
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 400,
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isActive ? 'var(--panel-hi)' : 'transparent',
                color: isActive ? 'var(--paper)' : 'var(--dim)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* LOG FEED CARDS */}
      <section className="stack" style={{ gap: 'var(--s3)' }}>
        {filteredLogs.length === 0 ? (
          <div className="panel" style={{ padding: 'var(--s5)', textAlign: 'center', color: 'var(--dim)' }}>
            No security logs recorded in category "{activeTab}".
          </div>
        ) : (
          filteredLogs.map((item) => (
            <article
              key={item.id}
              className="panel"
              style={{
                padding: 'var(--s4)',
                border: '1px solid var(--line-hi)',
                backgroundColor: 'var(--panel-hi)',
                borderRadius: '6px',
              }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s2)' }}>
                <div className="cluster" style={{ gap: 'var(--s2)', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                    {item.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      color: 'var(--dim)',
                      backgroundColor: 'var(--ink)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      border: '1px solid var(--line-hi)',
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: item.outcome.includes('Flagged') || item.outcome.includes('Turned Away') ? '#e11d48' : '#10b981',
                    backgroundColor: 'var(--ink)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--line-hi)',
                  }}
                >
                  * {item.outcome}
                </span>
              </div>

              <p style={{ color: 'var(--paper)', fontSize: '0.88rem', margin: '0 0 var(--s2) 0', lineHeight: 1.5 }}>
                {item.details}
              </p>

              <div className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--dim)' }}>
                <span>Logged {item.timestamp}</span>
                <span>Reporter: {item.reportedBy}</span>
              </div>
            </article>
          ))
        )}
      </section>

      {/* LOG SECURITY EVENT MODAL */}
      {modalOpen ? (
        <Modal
          title="Log Security Event"
          onClose={() => setModalOpen(false)}
          footer={
            <div className="cluster" style={{ justifyContent: 'flex-end', gap: 'var(--s2)' }}>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="sec-log-modal-form" className="btn btn-solid">
                [ Submit Log Entry ]
              </button>
            </div>
          }
        >
          <form id="sec-log-modal-form" onSubmit={handleSubmitLog}>
            <div className="stack" style={{ gap: 'var(--s3)' }}>
              <div className="field">
                <label className="eyebrow" htmlFor="log-event-type">
                  Event Type *
                </label>
                <select
                  id="log-event-type"
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
                <label className="eyebrow" htmlFor="log-loc">
                  Location / Gate *
                </label>
                <input
                  id="log-loc"
                  type="text"
                  className="control"
                  placeholder="e.g. Main Boom Gate 01"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="log-plate">
                  License Plate / Vehicle Reg (Optional)
                </label>
                <input
                  id="log-plate"
                  type="text"
                  className="control"
                  placeholder="e.g. GP 992 CP"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="log-notes">
                  Notes & Incident Description *
                </label>
                <textarea
                  id="log-notes"
                  className="control"
                  rows={4}
                  placeholder="Describe breach details, turned away visitor, or barrier issue..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
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
