import React from 'react';

/**
 * Standardized Status Color Mapping:
 * 1. Active / In Progress / Open / Dispatched (Brand Blue: var(--signal))
 * 2. Under Review / Pending / Awaiting Approval (Warm Amber: #d97706)
 * 3. Resolved / Completed / Closed / Expired / Approved (Muted Neutral Grey: var(--dim))
 * 4. Critical / Urgent / Failed / Emergency / Flagged / Rejected (Muted Rose: #e11d48)
 */
export function getStatusClass(status = '') {
  const norm = String(status).toLowerCase().replace(/[•·]/g, '').trim();

  if (
    norm.includes('flagged') ||
    norm.includes('rejected') ||
    norm.includes('urgent') ||
    norm.includes('critical') ||
    norm.includes('failed') ||
    norm.includes('emergency') ||
    norm.includes('sos') ||
    norm.includes('declined') ||
    norm.includes('priority') ||
    norm.includes('denied')
  ) {
    return 'status-critical';
  }

  if (
    norm.includes('active') ||
    norm.includes('in progress') ||
    norm.includes('open') ||
    norm.includes('dispatched') ||
    norm.includes('reported') ||
    norm.includes('on shift') ||
    norm.includes('patrolling') ||
    norm.includes('valid')
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
    norm.includes('clear') ||
    norm.includes('operational')
  ) {
    return 'status-resolved';
  }

  return 'status-resolved';
}

function formatSentenceCase(str = '') {
  const clean = String(str).replace(/[•·]/g, '').trim();
  if (!clean) return '';
  const words = clean.replace(/_/g, ' ').toLowerCase().split(' ');
  return words
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

function StatusBadge({ status }) {
  const cls = getStatusClass(status);
  const cleanText = formatSentenceCase(status);
  return (
    <span className={`status ${cls}`} title={`Status: ${cleanText}`}>
      {cleanText}
    </span>
  );
}

export default StatusBadge;
