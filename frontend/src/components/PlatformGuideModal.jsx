import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import DataTable from './DataTable';
import { useAuth } from '../context/AuthContext';

/*
 * Legend for the status system. There are seven states, each with one word
 * and one colour, and this is the single place their meanings are written
 * down. The pills are real StatusBadge components, so the legend cannot
 * drift away from what the rest of the interface renders.
 */

const STATE_GUIDE = [
  { state: 'urgent', meaning: 'Needs someone now. Emergency broadcasts, SOS alerts and notices you should read today.' },
  { state: 'waiting', meaning: 'A decision or a response is outstanding, usually from estate management or a responder.' },
  { state: 'new', meaning: 'Logged and not yet picked up by anyone.' },
  { state: 'active', meaning: 'Happening right now. A pass in use, work under way, or a patrol on its round.' },
  { state: 'cleared', meaning: 'Checked and allowed. A verified household, a pass cleared at the gate, a zone with nothing found.' },
  { state: 'complete', meaning: 'Finished. Nothing more to do.' },
  { state: 'closed', meaning: 'Settled, refused, or run out of time.' },
];

const ROLE_NOTES = {
  Resident:
    'You can report incidents, issue visitor passes for your own address, RSVP to community events, and read estate notices.',
  'Safety Volunteer':
    'You receive SOS alerts, triage incoming incidents, log patrol activity, and can view and RSVP to estate events.',
  'Estate Administrator':
    'You verify new members, publish notices, manage events, and see the full activity record.',
  'Security Guard':
    'You verify passes at the gate, view estate events, and log arrivals against the resident register.',
};

function PlatformGuideModal({ isOpen, onClose }) {
  const { userRole } = useAuth();
  if (!isOpen) return null;

  const activeRole = userRole || 'Resident';

  return (
    <Modal
      title="How this platform works"
      wide
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      }
    >
      <div className="alert alert-info" style={{ marginBottom: 18 }}>
        <div>
          <p className="strong" style={{ color: 'var(--ink)' }}>
            You are signed in as {activeRole}
          </p>
          <p style={{ marginTop: 2 }}>{ROLE_NOTES[activeRole] || ROLE_NOTES.Resident}</p>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--fs-13)', marginBottom: 8 }}>What the labels mean</h3>
      <div className="card">
        <div className="table-wrap">
          <DataTable
            caption="What the status labels mean"
            columns={[
              {
                key: 'label',
                header: 'Label',
                width: '120px',
                cell: (row) => <StatusBadge status={row.state} />,
              },
              { key: 'meaning', header: 'What it means', cell: (row) => row.meaning },
            ]}
            rows={STATE_GUIDE}
            getKey={(row) => row.state}
          />
        </div>
      </div>
    </Modal>
  );
}

export default PlatformGuideModal;
