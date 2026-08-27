import React from 'react';

export function StatusBadge({ status = '', className = '' }) {
  if (!status) return null;
  const cleanStr = String(status).replace(/[•·]/g, '').trim();
  const key = cleanStr.toUpperCase().replace(/[\s-]+/g, '_');

  const config = {
    // Brand Blue (Active / In Progress / Reported / Dispatched)
    ACTIVE: {
      label: 'Active',
      style: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    },
    REPORTED: {
      label: 'Reported',
      style: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      style: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    },
    DISPATCHED: {
      label: 'Dispatched',
      style: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    },

    // Amber / Gold (Under Review / Pending Actions)
    UNDER_REVIEW: {
      label: 'Under Review',
      style: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    },
    PENDING: {
      label: 'Pending',
      style: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    },
    PENDING_VERIFICATION: {
      label: 'Pending Verification',
      style: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    },

    // Rose / Crimson (Critical / Flagged / Rejected / Breaches / SOS)
    CRITICAL: {
      label: 'Critical',
      style: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    },
    FLAGGED: {
      label: 'Flagged',
      style: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    },
    REJECTED: {
      label: 'Rejected',
      style: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    },
    SOS_TRIGGERED: {
      label: 'SOS Alert',
      style: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    },
    SOS_ALERT: {
      label: 'SOS Alert',
      style: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    },

    // Muted Slate / Grey (Success / Resolved / Closed / Authorized)
    SUCCESS: {
      label: 'Success',
      style: 'text-neutral-300 bg-neutral-800/80 border-neutral-700/60',
    },
    AUTHORIZED: {
      label: 'Authorized',
      style: 'text-neutral-300 bg-neutral-800/80 border-neutral-700/60',
    },
    RESOLVED: {
      label: 'Resolved',
      style: 'text-neutral-400 bg-neutral-800/60 border-neutral-700/50',
    },
    COMPLETED: {
      label: 'Completed',
      style: 'text-neutral-400 bg-neutral-800/60 border-neutral-700/50',
    },
  };

  const current = config[key] || {
    label: cleanStr.replace(/_/g, ' '),
    style: 'text-neutral-300 bg-neutral-800 border-neutral-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono tracking-wider uppercase ${current.style} ${className}`}
    >
      {current.label}
    </span>
  );
}

export default StatusBadge;
