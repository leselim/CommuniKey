import React from 'react';

/**
 * Status marker. Red is reserved for emergencies and priority items, so the
 * remaining states read as a quiet three-step scale: new, in progress, closed.
 */
const TONE = {
  Priority: 'status-open',
  Active: 'status-open',
  Reported: 'status-active',
  'Under review': '',
  Resolved: 'status-closed',
};

function StatusBadge({ status }) {
  return <span className={`status ${TONE[status] || ''}`}>{status}</span>;
}

export default StatusBadge;
