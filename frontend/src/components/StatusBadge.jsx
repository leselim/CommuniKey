import React from 'react';

/*
 * Status pill.
 *
 * Seven states, and each one has exactly one word and one colour across the
 * whole product. A person learns seven words once, and after that a colour
 * always means the same thing whichever screen they are on.
 *
 *   Urgent    red     needs someone now
 *   Waiting   amber   a decision or a response is outstanding
 *   New       purple  logged, not yet picked up
 *   Active    blue    happening right now
 *   Cleared   teal    checked and allowed
 *   Complete  green   finished
 *   Closed    grey    settled, refused or run out
 *
 * The application still stores its own status values, because the records and
 * the API depend on them. This is the one place those values are turned into
 * something a person reads, so no screen can invent an eighth word.
 */

const STATES = {
  urgent: { label: 'Urgent', tone: 'red' },
  waiting: { label: 'Waiting', tone: 'amber' },
  new: { label: 'New', tone: 'purple' },
  active: { label: 'Active', tone: 'blue' },
  cleared: { label: 'Cleared', tone: 'teal' },
  complete: { label: 'Complete', tone: 'green' },
  closed: { label: 'Closed', tone: 'grey' },
};

export const STATE_ORDER = ['urgent', 'waiting', 'new', 'active', 'cleared', 'complete', 'closed'];

/* Every status value the application uses, and the state it belongs to. An
   unlisted value settles as Closed, so a new one has to be added on purpose
   rather than picking up a colour by accident. */
const VALUES = {
  // The seven words themselves, so a screen can name a state directly.
  WAITING: 'waiting',

  // Needs someone now
  CRITICAL: 'urgent',
  URGENT: 'urgent',
  EMERGENCY: 'urgent',
  SOS: 'urgent',
  SOS_ALERT: 'urgent',
  FLAGGED: 'urgent',
  FAILED: 'urgent',
  HIGH_PRIORITY: 'urgent',
  PRIORITY: 'urgent',

  // A decision or a response is outstanding
  UNDER_REVIEW: 'waiting',
  PENDING: 'waiting',
  PENDING_REVIEW: 'waiting',
  PENDING_VERIFICATION: 'waiting',
  AWAITING: 'waiting',
  AWAITING_RESPONSE: 'waiting',
  ON_STANDBY: 'waiting',
  SCHEDULED: 'waiting',

  // Logged, not yet picked up
  REPORTED: 'new',
  NEW: 'new',

  // Happening right now
  ACTIVE: 'active',
  IN_PROGRESS: 'active',
  PATROLLING: 'active',
  DISPATCHED: 'active',
  ACKNOWLEDGED: 'active',
  EN_ROUTE: 'active',
  ON_SCENE: 'active',
  ON_SHIFT: 'active',
  OPEN: 'active',
  OPERATIONAL: 'active',

  // Checked and allowed
  VERIFIED: 'cleared',
  VERIFIED_RESIDENT: 'cleared',
  AUTHORIZED: 'cleared',
  AUTHORISED: 'cleared',
  VALID: 'cleared',
  CLEAR: 'cleared',
  CLEARED: 'cleared',
  APPROVED: 'cleared',

  // Finished
  RESOLVED: 'complete',
  COMPLETED: 'complete',
  COMPLETE: 'complete',
  SUCCESS: 'complete',

  // Settled, refused or run out
  CLOSED: 'closed',
  EXPIRED: 'closed',
  REJECTED: 'closed',
  DECLINED: 'closed',
  DENIED: 'closed',
};

function keyOf(status) {
  return String(status || '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[\u2022\u00b7]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s\u2013\u2014-]+/g, '_');
}

export function stateOf(status) {
  return VALUES[keyOf(status)] || 'closed';
}

export function toneOf(status) {
  return STATES[stateOf(status)].tone;
}

export function labelOf(status) {
  return STATES[stateOf(status)].label;
}

export function stateMeta(state) {
  return STATES[state];
}

export function StatusBadge({ status = '', plain = false }) {
  if (!status) return null;

  const state = stateOf(status);
  const { label, tone } = STATES[state];

  return <span className={`pill ${plain ? 'pill-plain' : `tone-${tone}`}`}>{label}</span>;
}

export default StatusBadge;
