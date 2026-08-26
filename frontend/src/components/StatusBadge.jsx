import React from 'react';

/**
 * Standardized Status Color Mapping:
 * 1. Active / In Progress / Open / Dispatched (Brand Blue: var(--signal))
 * 2. Under Review / Pending / Awaiting Approval (Warm Amber: #d97706)
 * 3. Resolved / Completed / Closed / Expired / Approved (Muted Neutral Grey: var(--dim))
 * 4. Critical / Urgent / Failed / Emergency (Muted Rose: #e11d48)
 */
export function getStatusClass(status = '') {
  const norm = String(status).toLowerCase().trim();

  if (
    norm.includes('active') ||
    norm.includes('in progress') ||
    norm.includes('open') ||
    norm.includes('dispatched') ||
    norm.includes('reported') ||
    norm.includes('on shift') ||
    norm.includes('patrolling')
  ) {
    return 'status-active';
  }

  if (
    norm.includes('pending') ||
    norm.includes('under review') ||
    norm.includes('awaiting') ||
    norm.includes('scheduled')
  ) {
    return 'status-pending';
  }

  if (
    norm.includes('resolved') ||
    norm.includes('completed') ||
    norm.includes('closed') ||
    norm.includes('expired') ||
    norm.includes('approved') ||
    norm.includes('verified') ||
    norm.includes('success') ||
    norm.includes('standby') ||
    norm.includes('off duty') ||
    norm.includes('clear')
  ) {
    return 'status-resolved';
  }

  if (
    norm.includes('urgent') ||
    norm.includes('critical') ||
    norm.includes('failed') ||
    norm.includes('emergency') ||
    norm.includes('sos') ||
    norm.includes('declined') ||
    norm.includes('priority')
  ) {
    return 'status-critical';
  }

  return 'status-resolved';
}

function StatusBadge({ status }) {
  const cls = getStatusClass(status);
  return <span className={`status ${cls}`}>{status}</span>;
}

export default StatusBadge;
