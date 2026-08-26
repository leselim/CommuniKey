import React, { useState } from 'react';
import Modal from '../components/Modal';

const INITIAL_GUARD_LOGS = [
  {
    id: 'g-log-1',
    timestamp: '18:32:10',
    eventId: 'EV-402',
    type: 'Tailgating Breach',
    category: 'Gate Breaches',
    details: 'Main Boom Gate 01 · Unregistered Silver Sedan',
    status: 'FLAGGED',
  },
  {
    id: 'g-log-2',
    timestamp: '16:45:00',
    eventId: 'EV-388',
    type: 'Expired Pass Rejected',
    category: 'Access Denied',
    details: 'Terminal 01 · Host: Unit 08',
    status: 'REJECTED',
  },
  {
    id: 'g-log-3',
    timestamp: '15:10:42',
    eventId: 'EV-341',
    type: 'Manual Gate Release',
    category: 'Access Denied',
    details: 'Gate 01 · Authorized by Marcus V.',
    status: 'RESOLVED',
  },
  {
    id: 'g-log-4',
    timestamp: '12:20:05',
    eventId: 'EV-209',
    type: 'Perimeter Sensor Trigger',
    category: 'Perimeter',
    details: 'Sector 4 East Fence · Inspected by Sarah J.',
    status: 'RESOLVED',
  },
];

const FILTER_TABS = ['All Events', 'Gate Breaches', 'Access Denied', 'Perimeter'];

const EVENT_TYPES = [
  'Access Denial / Expired Credential',
  'Gate Barrier Tailgating / Forced Entry',
  'Suspicious Vehicle / Loitering',
  'Perimeter Breach / Fence Line Trigger',
  'Emergency Vehicle Rapid Dispatch',
];

const renderStatusCell = (status) => {
  if (status === 'FLAGGED') {
    return <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.78rem' }}>• FLAGGED</span>;
  }
  if (status === 'REJECTED') {
    return <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.78rem' }}>• REJECTED</span>;
  }
  return <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.78rem' }}>• RESOLVED</span>;
};

function GuardhouseIncidents() {
  const [logs, setLogs] = useState(INITIAL_GUARD_LOGS);
  const [activeTab, setActiveTab] = useState('All Events');
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Form State
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [gateLocation] = useState('Main Gate 01');
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
    if (eventType.includes('Tailgating') || eventType.includes('Entry')) category = 'Gate Breaches';
    if (eventType.includes('Perimeter')) category = 'Perimeter';

    const newIdNum = 400 + Math.floor(Math.random() * 100);
    const newEntry = {
      id: `g-log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventId: `EV-${newIdNum}`,
      type: eventType,
      category: category,
      details: `${gateLocation} · ${notesInput.trim()}${plateInput ? ` · Plate: ${plateInput.trim().toUpperCase()}` : ''}`,
      status: 'FLAGGED',
    };

    setLogs([newEntry, ...logs]);
    setModalOpen(false);
    setNotesInput('');
    setPlateInput('');
    setNotice(`Security event "${eventType}" saved to gate ledger successfully.`);
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* PAGE HEADER */}
      <header className="masthead" style={{ borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 0 }}>
            Security & Access Log
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0' }}>
            Operational records, flagged access attempts, and barrier events for Gate 01.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => setModalOpen(true)}
            style={{ fontWeight: 600 }}
          >
            [ + Log Event ]
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

      {/* RECENT SECURITY LOG DATA TABLE */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
            RECENT SECURITY & ACCESS EVENTS (MAIN GATE 01)
          </p>
          <span className="mono sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>
            Live Audit Stream
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-hi)', color: 'var(--dim)' }}>
                <th style={{ padding: '8px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px' }}>EVENT ID</th>
                <th style={{ padding: '8px' }}>INCIDENT TYPE</th>
                <th style={{ padding: '8px' }}>DETAILS & LOCATION</th>
                <th style={{ padding: '8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--s5)', textAlign: 'center', color: 'var(--dim)' }}>
                    No security events recorded in category "{activeTab}".
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--line-hi)' }}>
                    <td className="mono" style={{ padding: '10px 8px', color: 'var(--paper)' }}>{item.timestamp}</td>
                    <td className="mono" style={{ padding: '10px 8px', color: 'var(--signal)', fontWeight: 600, cursor: 'pointer' }}>{item.eventId}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--paper)', fontWeight: 500 }}>{item.type}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--dim)' }}>{item.details}</td>
                    <td style={{ padding: '10px 8px' }}>{renderStatusCell(item.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* LOG EVENT MODAL */}
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
                [ Save to Gate Ledger ]
              </button>
            </div>
          }
        >
          <form id="sec-log-modal-form" onSubmit={handleSubmitLog}>
            <div className="stack" style={{ gap: 'var(--s3)' }}>
              <div className="field">
                <label className="eyebrow" htmlFor="log-event-type">
                  Event Category
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
                <label className="eyebrow" htmlFor="log-plate">
                  Vehicle License Plate (Optional)
                </label>
                <input
                  id="log-plate"
                  type="text"
                  className="control"
                  placeholder="e.g. GP 88 YZ"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="log-loc">
                  Access Point / Gate
                </label>
                <input
                  id="log-loc"
                  type="text"
                  className="control"
                  value={gateLocation}
                  readOnly
                  style={{ backgroundColor: 'var(--ink)', color: 'var(--dim)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="log-notes">
                  Operational Summary / Notes
                </label>
                <textarea
                  id="log-notes"
                  className="control"
                  rows={4}
                  placeholder="Describe physical security details, loitering vehicle, or barrier issue..."
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
