import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';

function PlatformGuideModal({ isOpen, onClose }) {
  const { userRole } = useAuth();
  if (!isOpen) return null;

  const activeRole = userRole || 'Resident';

  return (
    <Modal
      title="Status & Interface Guide"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-solid" onClick={onClose} style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
          Got It
        </button>
      }
    >
      <div className="stack" style={{ gap: 'var(--s4)' }}>
        {/* Active Role Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            padding: 'var(--s2) var(--s3)',
            backgroundColor: 'var(--panel-hi)',
            border: '1px solid var(--line-hi)',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--dim)' }}>Active Role</span>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--paper)',
              backgroundColor: 'var(--panel-lo)',
              padding: '2px 8px',
              borderRadius: '3px',
              border: '1px solid var(--line-lo)',
            }}
          >
            {activeRole}
          </span>
        </div>

        {/* Primary Content: Status Indicator Legend */}
        <section className="stack" style={{ gap: 'var(--s3)' }}>
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--dim)' }}>
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
                  <td style={{ padding: 'var(--s2)', whiteSpace: 'nowrap' }}>
                    <StatusBadge status="Active" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong style={{ color: 'var(--paper)' }}>Brand Blue (ACTIVE / IN PROGRESS):</strong> Live gate passes, active incident responses, or ongoing maintenance.
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)', whiteSpace: 'nowrap' }}>
                    <StatusBadge status="Under Review" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong style={{ color: 'var(--paper)' }}>Amber (UNDER REVIEW / PENDING):</strong> Requests awaiting approval or verification.
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)', whiteSpace: 'nowrap' }}>
                    <StatusBadge status="Resolved" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong style={{ color: 'var(--paper)' }}>Muted Grey (RESOLVED / COMPLETED):</strong> Closed tickets and expired passes.
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td style={{ padding: 'var(--s2)', whiteSpace: 'nowrap' }}>
                    <StatusBadge status="Critical" />
                  </td>
                  <td style={{ padding: 'var(--s2)', color: 'var(--dim)' }}>
                    <strong style={{ color: 'var(--paper)' }}>Muted Rose (CRITICAL / SOS):</strong> Active emergency broadcasts and urgent alerts.
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

