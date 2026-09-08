import React from 'react';

/*
 * Status marker.
 *
 * Tone carries the meaning and is applied by CSS class, never inline:
 * blue for anything live, teal for work in progress, ochre for anything
 * waiting on a person, brick for danger, grey for anything already settled.
 * Labels are sentence case because a wall of capitals is harder to scan.
 *
 * Every status string used anywhere in the application is listed here.
 * An unlisted value still renders, but it falls back to grey, so new
 * states must be added rather than left to guess at their own colour.
 */

const TONES = {
  // Settled. Deliberately neutral so finished work stops competing.
  SUCCESS: ['Success', 'done'],
  RESOLVED: ['Resolved', 'done'],
  COMPLETED: ['Completed', 'done'],
  CLOSED: ['Closed', 'done'],
  EXPIRED: ['Expired', 'done'],
  APPROVED: ['Approved', 'done'],

  // Verified account / identity.
  VERIFIED: ['Verified', 'verified'],
  VERIFIED_RESIDENT: ['Verified resident', 'verified'],

  // Authorised gate access.
  AUTHORIZED: ['Authorised', 'authorized'],
  AUTHORISED: ['Authorised', 'authorized'],
  VALID: ['Valid', 'authorized'],

  // Clear zone status.
  CLEAR: ['Clear', 'clear'],

  // Active patrol operation.
  PATROLLING: ['Patrolling', 'patrolling'],

  // Waiting on a person to act.
  UNDER_REVIEW: ['Under review', 'wait'],
  PENDING: ['Pending', 'wait'],
  PENDING_REVIEW: ['Pending review', 'wait'],
  PENDING_VERIFICATION: ['Pending verification', 'verification'],

  // Awaiting dispatch / responder response.
  AWAITING: ['Awaiting', 'awaiting'],
  AWAITING_RESPONSE: ['Awaiting response', 'awaiting'],
  SCHEDULED: ['Scheduled', 'wait'],
  ON_STANDBY: ['On standby', 'wait'],

  // Priority broadcasts and notices.
  PRIORITY: ['High priority', 'priority'],
  HIGH_PRIORITY: ['High priority', 'priority'],

  // Work currently in motion.
  IN_PROGRESS: ['In progress', 'progress'],

  // Newly reported incident/item.
  REPORTED: ['Reported', 'reported'],

  // Happening now.
  ACTIVE: ['Active', 'live'],
  DISPATCHED: ['Dispatched', 'live'],
  OPEN: ['Open', 'live'],
  OPERATIONAL: ['Operational', 'live'],
  ON_SHIFT: ['On shift', 'live'],
  ON_SCENE: ['On scene', 'live'],
  EN_ROUTE: ['En route', 'live'],
  ACKNOWLEDGED: ['Acknowledged', 'live'],

  // Needs someone now.
  FLAGGED: ['Flagged', 'risk'],
  REJECTED: ['Rejected', 'risk'],
  DECLINED: ['Declined', 'risk'],
  CRITICAL: ['Critical', 'risk'],
  URGENT: ['Urgent', 'risk'],
  FAILED: ['Failed', 'risk'],
  EMERGENCY: ['Emergency', 'risk'],
  SOS: ['SOS alert', 'risk'],
  SOS_ALERT: ['SOS alert', 'risk'],
};

function sentenceCase(text) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function StatusBadge({ status = '', plain = false }) {
  if (!status) return null;

  const clean = String(status).replace(/[\u2022\u00b7]/g, '').trim();
  if (!clean) return null;

  // "Verified (Resident)" keeps its qualifier but matches on the first part.
  const qualifier = clean.match(/\(([^)]+)\)/);
  const base = clean.replace(/\([^)]*\)/g, '').trim();
  const key = base.toUpperCase().replace(/[\s\u2013\u2014-]+/g, '_');

  const entry = TONES[key];
  const label = entry ? entry[0] : sentenceCase(base.replace(/_/g, ' '));
  const tone = entry ? entry[1] : 'done';

  return (
    <span className={`chip chip-${tone}${plain ? ' chip-plain' : ''}`}>
      {qualifier ? `${label}, ${qualifier[1].toLowerCase()}` : label}
    </span>
  );
}

export default StatusBadge;
