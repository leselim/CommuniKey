import React from 'react';

export function StatusBadge({ status = '' }) {
  if (!status) return null;
  const clean = String(status).replace(/[•·]/g, '').trim();
  const norm = clean.toUpperCase().replace(/[\s-]+/g, '_');

  const badgeStyles = {
    SUCCESS: { label: '• SUCCESS', style: 'text-neutral-300 font-semibold' },
    RESOLVED: { label: '• RESOLVED', style: 'text-neutral-400 font-semibold' },
    AUTHORIZED: { label: '• AUTHORIZED', style: 'text-neutral-300 font-semibold' },
    UNDER_REVIEW: { label: '• UNDER REVIEW', style: 'text-amber-500 font-semibold' },
    PENDING: { label: '• PENDING', style: 'text-amber-400 font-semibold' },
    PENDING_VERIFICATION: { label: '• PENDING VERIFICATION', style: 'text-amber-400 font-semibold' },
    FLAGGED: { label: '• FLAGGED', style: 'text-rose-500 font-semibold' },
    REJECTED: { label: '• REJECTED', style: 'text-rose-500 font-semibold' },
    CRITICAL: { label: '• CRITICAL', style: 'text-rose-500 font-semibold' },
    REPORTED: { label: '• REPORTED', style: 'text-blue-400 font-semibold' },
    ACTIVE: { label: '• ACTIVE', style: 'text-blue-400 font-semibold' },
    IN_PROGRESS: { label: '• IN PROGRESS', style: 'text-blue-400 font-semibold' },
    DISPATCHED: { label: '• DISPATCHED', style: 'text-blue-400 font-semibold' },
  };

  const current = badgeStyles[norm] || {
    label: `• ${norm.replace(/_/g, ' ')}`,
    style: 'text-neutral-400 font-semibold',
  };

  return (
    <span className={`font-mono text-xs ${current.style}`} style={{ letterSpacing: '0.04em' }}>
      {current.label}
    </span>
  );
}

export default StatusBadge;
