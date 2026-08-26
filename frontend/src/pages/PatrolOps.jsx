import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';

const PATROL_ZONES = [
  { id: 1, zone: 'Section A Perimeter', status: 'Clear', lastChecked: '15 mins ago by Sarah Jenkins', notes: 'Fence sensors active. Barrier gates locked.' },
  { id: 2, zone: 'Section B Mill Road Route', status: 'Patrolling', lastChecked: 'Active Now', notes: 'Foot patrol checking streetlights #10 to #18.' },
  { id: 3, zone: 'North Boundary Wall', status: 'Clear', lastChecked: '1h ago by Night Patrol Team', notes: 'Infrared cameras clear. Zero activity.' },
  { id: 4, zone: 'Clubhouse & Pool Area', status: 'Clear', lastChecked: '45 mins ago', notes: 'Facilities locked. Security locks intact.' },
];

const GUARDHOUSE_LOGS = [
  { id: 101, time: '16:45', note: 'Main Gate shift handover complete. Guardhouse radios tested.', loggedBy: 'Officer Maposa (Main Gate)' },
  { id: 102, time: '15:30', note: 'Visitor Pass CK-492 validated for Johan Smith. Entered at 15:32.', loggedBy: 'Guardhouse Control' },
  { id: 103, time: '14:10', note: 'Contractor Protea Gate Automation completed hydraulic arm inspection.', loggedBy: 'Officer Maposa (Main Gate)' },
];

function PatrolOps() {
  const [shiftActive, setShiftActive] = useState(true);
  const [logs, setLogs] = useState(GUARDHOUSE_LOGS);
  const [newNote, setNewNote] = useState('');
  const [notice, setNotice] = useState('');

  const handleToggleShift = () => {
    setShiftActive(!shiftActive);
    setNotice(!shiftActive ? 'Checked in for active patrol shift.' : 'Shift check-out logged cleanly.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs([
      { id: Date.now(), time: timeStr, note: newNote.trim(), loggedBy: 'Sarah Jenkins (Safety Volunteer)' },
      ...logs,
    ]);
    setNewNote('');
    setNotice('Guardhouse coordination note added.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* Masthead Header */}
      <header className="masthead">
        <div>
          <p className="eyebrow">
            Safety Volunteer Operations
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>Patrol Operations & Guardhouse Coordination</h1>
          <p className="masthead-meta" style={{ marginTop: 'var(--s2)' }}>
            Shift check-in, live sector rounds, perimeter fence status, and main gate guardhouse logs.
          </p>
        </div>

        <div className="cluster" style={{ gap: 'var(--s3)' }}>
          <button
            type="button"
            className={shiftActive ? 'btn btn-solid' : 'btn'}
            onClick={handleToggleShift}
          >
            {shiftActive ? 'Active Patrol Shift (Checked In)' : 'Check In for Shift'}
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* Patrol Zones Panel */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              PATROL SECTORS & PERIMETER STATUS
            </p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Active Patrol Zones & Rounds
            </h2>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 'var(--s4)' }}>
          {PATROL_ZONES.map((z) => (
            <div
              key={z.id}
              style={{
                padding: 'var(--s4)',
                backgroundColor: 'var(--panel-hi)',
                border: '1px solid var(--line-hi)',
                borderRadius: '4px',
              }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                  {z.zone}
                </h3>
                <StatusBadge status={z.status} />
              </div>
              <p className="sm faint" style={{ color: 'var(--dim)', margin: '0 0 var(--s2) 0' }}>
                Last Checked: {z.lastChecked}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', margin: 0 }}>
                {z.notes}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Guardhouse Coordination Logs Panel */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              GUARDHOUSE COORDINATION LOG
            </p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Live Security Desk & Shift Logs
            </h2>
          </div>
        </div>

        <form onSubmit={handleAddLog} className="cluster" style={{ marginBottom: 'var(--s4)', gap: 'var(--s3)' }}>
          <input
            type="text"
            className="control"
            placeholder="Add quick guardhouse coordination note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-solid">
            Log Note
          </button>
        </form>

        <ul className="ledger">
          {logs.map((log) => (
            <li
              className="entry"
              key={log.id}
              style={{ display: 'block', padding: 'var(--s3) 0', borderBottom: '1px solid var(--line-hi)' }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '2px' }}>
                <span className="mono sm" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                  [{log.time}]
                </span>
                <span className="mono sm faint" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>
                  {log.loggedBy}
                </span>
              </div>
              <p className="sm" style={{ color: 'var(--paper)', margin: 0 }}>
                {log.note}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default PatrolOps;
