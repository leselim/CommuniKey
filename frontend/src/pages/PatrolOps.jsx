import React, { useState } from 'react';
import Icon from '../components/Icon';
import DataTable, { CellTime } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Card, SectionBar, Toast } from '../components/ui';

const PATROL_ZONES = [
  { id: 1, zone: 'Section A perimeter', status: 'Clear', lastChecked: '15 mins ago by Sarah Jenkins', notes: 'Fence sensors active. Barrier gates locked.' },
  { id: 2, zone: 'Section B, Mill Road route', status: 'Patrolling', lastChecked: 'Active now', notes: 'Foot patrol checking streetlights 10 to 18.' },
  { id: 3, zone: 'North boundary wall', status: 'Clear', lastChecked: '1h ago by Night Patrol Team', notes: 'Infrared cameras clear. No activity.' },
  { id: 4, zone: 'Clubhouse and pool area', status: 'Clear', lastChecked: '45 mins ago', notes: 'Facilities locked. Security locks intact.' },
];

const GUARDHOUSE_LOGS = [
  { id: 101, time: '16:45', note: 'Main gate shift handover complete. Guardhouse radios tested.', loggedBy: 'Officer Maposa (Main Gate)' },
  { id: 102, time: '15:30', note: 'Visitor pass CK-492 validated for Johan Smith. Entered at 15:32.', loggedBy: 'Guardhouse Control' },
  { id: 103, time: '14:10', note: 'Contractor Protea Gate Automation completed hydraulic arm inspection.', loggedBy: 'Officer Maposa (Main Gate)' },
];

function PatrolOps() {
  const [shiftActive, setShiftActive] = useState(true);
  const [logs, setLogs] = useState(GUARDHOUSE_LOGS);
  const [newNote, setNewNote] = useState('');
  const [notice, setNotice] = useState('');

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice((current) => (current === message ? '' : current)), 4000);
  };

  const handleToggleShift = () => {
    setShiftActive(!shiftActive);
    flash(!shiftActive ? 'Checked in for your patrol shift.' : 'Shift check out logged.');
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs([{ id: Date.now(), time: timeStr, note: newNote.trim(), loggedBy: 'Sarah Jenkins (Safety Volunteer)' }, ...logs]);
    setNewNote('');
    flash('Note added to the security desk log.');
  };

  const clear = PATROL_ZONES.filter((z) => z.status === 'Clear').length;
  const patrolling = PATROL_ZONES.filter((z) => z.status === 'Patrolling').length;

  return (
    <div className="page">
      <SectionBar
        icon="route"
        title="Patrol and guardhouse"
        stats={[
          { label: 'Zones clear:', value: `${clear} of ${PATROL_ZONES.length}` },
          { label: 'Being patrolled:', value: patrolling },
          { label: 'Your shift:', value: shiftActive ? <StatusBadge status="On shift" /> : <span className="muted">Not checked in</span> },
        ]}
      >
        <button type="button" className={shiftActive ? 'btn' : 'btn btn-primary'} onClick={handleToggleShift}>
          <Icon name={shiftActive ? 'logout' : 'check'} />
          {shiftActive ? 'Check out of shift' : 'Check in for shift'}
        </button>
      </SectionBar>

      <div className="grid grid-4">
        {PATROL_ZONES.map((z) => (
          <div className="zone" key={z.id}>
            <div className="zone-head">
              <h3 className="zone-name">{z.zone}</h3>
              <StatusBadge status={z.status} />
            </div>
            <p className="zone-note">{z.notes}</p>
            <p className="zone-time">
              <Icon name="clock" />
              {z.lastChecked}
            </p>
          </div>
        ))}
      </div>

      <Card title="Security desk and shift log" sub="Shared with the guardhouse. Newest first." flush>
        <form onSubmit={handleAddLog} className="toolbar" style={{ flexWrap: 'nowrap' }}>
          <label htmlFor="log-note" className="sr-only">
            Coordination note
          </label>
          <input
            id="log-note"
            type="text"
            className="control"
            placeholder="Add a note for the guardhouse"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ height: 36 }}>
            <Icon name="plus" />
            Log note
          </button>
        </form>

        <DataTable
          caption="Security desk and shift log"
          columns={[
            { key: 'time', header: 'Time', width: '110px', cell: (log) => <CellTime>{log.time}</CellTime> },
            { key: 'note', header: 'Note', cell: (log) => <span style={{ color: 'var(--ink)' }}>{log.note}</span> },
            { key: 'by', header: 'Logged by', width: '30%', cell: (log) => log.loggedBy },
          ]}
          rows={logs}
        />
      </Card>

      <Toast message={notice} />
    </div>
  );
}

export default PatrolOps;
