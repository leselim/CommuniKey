import React, { useState } from 'react';
import Modal from '../components/Modal';

const INITIAL_GUARD_LOGS = [
  {
    id: 'g-log-1',
    title: 'Tailgating Attempt Flagged',
    category: 'Gate Breaches',
    details: 'Main Boom Gate 01 · Vehicle: Silver Sedan (Unregistered)',
    outcome: 'Flagged & Intercepted',
    timestamp: '20 mins ago',
    reporterShort: 'Sipho D.',
  },
  {
    id: 'g-log-2',
    title: 'Expired Pass Rejected',
    category: 'Access Denied',
    details: 'Visitor code 771-304 rejected at Terminal 01 · Host: Unit 08',
    outcome: 'Turned Away',
    timestamp: '1 hour ago',
    reporterShort: 'Sipho D.',
  },
  {
    id: 'g-log-3',
    title: 'Manual Override Logged',
    category: 'Access Denied',
    details: 'Resident pass 492-801 manually authorized by Admin Marcus',
    outcome: 'Approved',
    timestamp: '2 hours ago',
    reporterShort: 'Marcus V.',
  },
  {
    id: 'g-log-4',
    title: 'Perimeter Sensor Trigger',
    category: 'Perimeter',
    details: 'Sector 4 East Fence · Inspected by Patrol Volunteer Sarah',
    outcome: 'Cleared',
    timestamp: 'Yesterday',
    reporterShort: 'Sarah J.',
  },
];

const FILTER_TABS = ['All Events', 'Gate Breaches', 'Access Denied', 'Perimeter'];

const EVENT_TYPES = [
  'Tailgating',
  'Invalid Access Attempt',
  'Physical Barrier Issue',
  'Suspicious Vehicle',
];

const getStatusPillStyle = (outcome) => {
  if (outcome === 'Flagged & Intercepted' || outcome.includes('Flagged')) {
    return {
      color: '#f87171',
      backgroundColor: 'rgba(153, 27, 27, 0.25)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  }
  if (outcome === 'Turned Away' || outcome.includes('Denied') || outcome.includes('Rejected')) {
    return {
      color: '#fbbf24',
      backgroundColor: 'rgba(146, 64, 14, 0.25)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  }
  return {
    color: '#a3a3a3',
    backgroundColor: 'rgba(38, 38, 38, 0.4)',
    border: '1px solid rgba(64, 64, 64, 0.4)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 500,
  };
};

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
      details: `${locationInput.trim()} · ${notesInput.trim()}${plateInput ? ` · Plate: ${plateInput.trim().toUpperCase()}` : ''}`,
      outcome: 'Flagged & Intercepted',
      timestamp: 'Just now',
      reporterShort: 'Sipho D.',
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
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 0 }}>
            Security & Access Incidents
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0' }}>
            Main Gate 01 operational activity and flagged events.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => setModalOpen(true)}
            style={{ fontWeight: 600 }}
          >
            + Log Incident
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
              {/* TOP ROW */}
              <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s2)' }}>
                <div className="cluster" style={{ gap: 'var(--s2)', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                    {item.title}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--dim)', fontWeight: 400 }}>
                    {item.category}
                  </span>
                </div>

                <span style={getStatusPillStyle(item.outcome)}>
                  {item.outcome}
                </span>
              </div>

              {/* MIDDLE ROW SUMMARY */}
              <p style={{ color: 'var(--paper)', fontSize: '0.88rem', margin: '0 0 var(--s2) 0', lineHeight: 1.5 }}>
                {item.details}
              </p>

              {/* BOTTOM ROW TIMESTAMP & REPORTER */}
              <div className="cluster" style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>
                <span>{item.timestamp} · Logged by {item.reporterShort || 'Sipho D.'}</span>
              </div>
            </article>
          ))
        )}
      </section>

      {/* LOG SECURITY EVENT MODAL */}
      {modalOpen ? (
        <Modal
          title="Log Incident"
          onClose={() => setModalOpen(false)}
          footer={
            <div className="cluster" style={{ justifyContent: 'flex-end', gap: 'var(--s2)' }}>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="sec-log-modal-form" className="btn btn-solid">
                Submit Log Entry
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
