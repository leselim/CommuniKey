import React from 'react';

export function StatusBadge({ status = '' }) {
  if (!status) return null;
  const clean = String(status).replace(/[•·]/g, '').trim();
  const norm = clean.toUpperCase().replace(/[\s-]+/g, '_');

  const badgeStyles = {
    SUCCESS: { label: '• SUCCESS', style: 'text-neutral-400' },
    RESOLVED: { label: '• RESOLVED', style: 'text-neutral-400' },
    AUTHORIZED: { label: '• AUTHORIZED', style: 'text-neutral-300' },
    COMPLETED: { label: '• COMPLETED', style: 'text-neutral-400' },
    UNDER_REVIEW: { label: '• UNDER REVIEW', style: 'text-amber-500' },
    PENDING: { label: '• PENDING', style: 'text-amber-500' },
    PENDING_VERIFICATION: { label: '• PENDING VERIFICATION', style: 'text-amber-500' },
    FLAGGED: { label: '• FLAGGED', style: 'text-rose-500' },
    REJECTED: { label: '• REJECTED', style: 'text-rose-500' },
    CRITICAL: { label: '• CRITICAL', style: 'text-rose-500' },
    SOS: { label: '• SOS ALERT', style: 'text-rose-500' },
    SOS_ALERT: { label: '• SOS ALERT', style: 'text-rose-500' },
    REPORTED: { label: '• REPORTED', style: 'text-blue-500' },
    ACTIVE: { label: '• ACTIVE', style: 'text-blue-500' },
    IN_PROGRESS: { label: '• IN PROGRESS', style: 'text-blue-500' },
    DISPATCHED: { label: '• DISPATCHED', style: 'text-blue-500' },
  };

  const current = badgeStyles[norm] || {
    label: `• ${norm.replace(/_/g, ' ')}`,
    style: 'text-neutral-400',
  };

  return (
    <span className={`font-mono text-xs font-semibold ${current.style}`} style={{ letterSpacing: '0.04em' }}>
      {current.label}
    </span>
  );
}

export default StatusBadge;
