import React from 'react';

export function StatusBadge({ status = '' }) {
  if (!status) return null;
  const cleanStr = String(status).replace(/[•·]/g, '').trim();
  const normalized = cleanStr.toUpperCase().replace(/[\s-]+/g, '_');

  const badgeStyles = {
    SUCCESS: {
      label: 'Success',
      className: 'bg-neutral-800 text-neutral-300 border-neutral-700/60',
    },
    RESOLVED: {
      label: 'Resolved',
      className: 'bg-neutral-800 text-neutral-400 border-neutral-700/60',
    },
    AUTHORIZED: {
      label: 'Authorized',
      className: 'bg-neutral-800 text-neutral-300 border-neutral-700/60',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      className: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
    },
    PENDING_VERIFICATION: {
      label: 'Pending',
      className: 'bg-amber-950/30 text-amber-200 border-amber-800/30',
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-950/30 text-amber-200 border-amber-800/30',
    },
    FLAGGED: {
      label: 'Flagged',
      className: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
    },
    REJECTED: {
      label: 'Rejected',
      className: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
    },
    REPORTED: {
      label: 'Reported',
      className: 'bg-neutral-800 text-neutral-300 border-neutral-700/60',
    },
  };

  const current = badgeStyles[normalized] || {
    label: cleanStr.replace(/_/g, ' '),
    className: 'bg-neutral-800 text-neutral-400 border-neutral-700/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide uppercase font-mono ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export default StatusBadge;
