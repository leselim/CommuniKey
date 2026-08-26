import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

function PlatformGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <Modal
      title="Platform Roles & Status System Guide"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-solid" onClick={onClose} style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
          Got It
        </button>
      }
    >
      <div className="stack" style={{ gap: 'var(--s5)' }}>
        {/* Section 1: Role Perspectives */}
        <section className="stack" style={{ gap: 'var(--s3)' }}>
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            ROLE PERSPECTIVES OVERVIEW
          </p>
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div style={{ padding: 'var(--s3) var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)', borderRadius: '4px' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--paper)' }}>Resident (Thabo Mokoena)</strong>
              <p className="sm faint" style={{ color: 'var(--dim)', margin: '4px 0 0 0', fontSize: '0.78rem' }}>
                Generate visitor gate passes, view estate announcements, log maintenance requests, track personal tickets, and RSVP to community gatherings.
              </p>
            </div>

            <div style={{ padding: 'var(--s3) var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)', borderRadius: '4px' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--paper)' }}>Safety Volunteer (Sarah Jenkins)</strong>
              <p className="sm faint" style={{ color: 'var(--dim)', margin: '4px 0 0 0', fontSize: '0.78rem' }}>
                Monitor the real-time incident triage feed, manage live emergency SOS alerts, track sector patrol rounds, and coordinate responder rosters.
              </p>
            </div>

            <div style={{ padding: 'var(--s3) var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)', borderRadius: '4px' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--paper)' }}>Estate Administrator (Marcus Vance)</strong>
              <p className="sm faint" style={{ color: 'var(--dim)', margin: '4px 0 0 0', fontSize: '0.78rem' }}>
                Oversee platform analytics, draft and publish official broadcasts, review member verification documents, and audit administrative activity logs.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Status Indicator Legend */}
        <section className="stack" style={{ gap: 'var(--s3)' }}>
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            STANDARDIZED STATUS INDICATOR LEGEND
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line-hi)', color: 'var(--dim)' }}>
                  <th style={{ padding: 'var(--s2)', fontWeight: 600 }}>Indicator</th>
                  <th style={{ padding: 'var(--s2)', fontWeight: 600 }}>Meaning & Usage</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)' }}>
                    <StatusBadge status="Active" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong>Brand Blue:</strong> Live records, active gate passes, ongoing maintenance, and active patrol shifts.
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)' }}>
                    <StatusBadge status="Under Review" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong>Warm Amber:</strong> Items awaiting triage, resident ID verification, or administrator review.
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)' }}>
                    <StatusBadge status="Resolved" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong>Muted Grey:</strong> Finished records, completed maintenance, expired passes, and standby personnel fading back to reduce noise.
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)' }}>
                    <StatusBadge status="Critical" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong>Muted Rose / Red:</strong> Immediate safety alerts, SOS emergency dispatches, and high-priority alerts.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default PlatformGuideModal;
