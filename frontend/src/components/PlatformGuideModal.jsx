import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';

/*
 * Legend for the status system. Colour carries one meaning throughout the
 * application, so this is the single place that meaning is written down.
 * The examples are real StatusBadge components rather than copies, so the
 * legend cannot drift away from what the interface actually renders.
 */

const LEGEND = [
  {
    status: 'Active',
    meaning: 'Live right now. A valid gate pass or active community notice.',
  },
  {
    status: 'Verified',
    meaning: 'Authenticated member profile or confirmed household address.',
  },
  {
    status: 'Authorised',
    meaning: 'Valid gate pass code or vehicle entry cleared at security checkpoint.',
  },
  {
    status: 'Patrolling',
    meaning: 'Active safety volunteer or security team performing neighbourhood watch patrol.',
  },
  {
    status: 'Reported',
    meaning: 'Newly logged incident or issue awaiting initial response or assignment.',
  },
  {
    status: 'In progress',
    meaning: 'Work actively under way. Maintenance dispatched, a repair in motion, or an incident being handled.',
  },
  {
    status: 'Awaiting',
    meaning: 'Volunteer or safety responder standing by for patrol duty or dispatch.',
  },
  {
    status: 'Clear',
    meaning: 'Perimeter check or zone inspection completed with no active incidents found.',
  },
  {
    status: 'High priority',
    meaning: 'Time-sensitive estate broadcast or important community notice.',
  },
  {
    status: 'Under Review',
    meaning: 'Waiting on a person to make a decision, usually estate management.',
  },
  {
    status: 'Pending verification',
    meaning: 'Submitted document or household registration undergoing identity verification.',
  },
  {
    status: 'Resolved',
    meaning: 'Settled and closed. Deliberately grey so finished work stops competing for attention.',
  },
  {
    status: 'Critical',
    meaning: 'Needs someone now. Emergency broadcasts and SOS alerts.',
  },
];

const ROLE_NOTES = {
  Resident:
    'You can report incidents, issue visitor passes for your own address, and see estate notices.',
  'Safety Volunteer':
    'You receive SOS alerts, triage incoming incidents, and log patrol activity.',
  'Estate Administrator':
    'You verify new members, publish broadcasts, and see the full activity log.',
  'Security Guard':
    'You verify passes at the gate and log arrivals against the resident register.',
};

function PlatformGuideModal({ isOpen, onClose }) {
  const { userRole } = useAuth();
  if (!isOpen) return null;

  const activeRole = userRole || 'Resident';

  return (
    <Modal
      title="How this platform works"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-solid" onClick={onClose}>
          Got it
        </button>
      }
    >
      <section className="section">
        <div className="section-head">
          <h3>You are signed in as</h3>
          <span className="chip chip-live">{activeRole}</span>
        </div>
        <p className="sm dim">{ROLE_NOTES[activeRole] || ROLE_NOTES.Resident}</p>
      </section>

      <section className="section" style={{ marginTop: 'var(--s5)' }}>
        <div className="section-head">
          <h3>What the labels mean</h3>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Label</th>
                <th scope="col">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {LEGEND.map((row) => (
                <tr key={row.status}>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Modal>
  );
}

export default PlatformGuideModal;
