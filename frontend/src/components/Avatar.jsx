import React from 'react';

/*
 * Monogram avatar.
 *
 * There are no uploaded photos in this system, so each person gets a quiet
 * tint derived from their name. The same person is always the same tint
 * everywhere, and the tints stay well away from the status colours so an
 * avatar is never mistaken for a signal.
 */

const TINTS = [
  { bg: '#E9EBEF', fg: '#3F4550' },
  { bg: '#E6ECF2', fg: '#34506B' },
  { bg: '#ECE9E4', fg: '#5A4E3C' },
  { bg: '#E7EDEA', fg: '#3D5A4E' },
  { bg: '#EDE8EE', fg: '#5A4561' },
  { bg: '#F0E9E6', fg: '#6A4638' },
];

export function initialsOf(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function tintFor(seed) {
  const text = String(seed || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000;
  }
  return TINTS[hash % TINTS.length];
}

function Avatar({ name, size = 'md', presence, className = '', title }) {
  const tint = tintFor(name);
  const sizeClass = size === 'md' ? '' : `avatar-${size}`;

  const badge = (
    <span
      className={`avatar ${sizeClass} ${className}`.replace(/\s+/g, ' ').trim()}
      style={{ backgroundColor: tint.bg, color: tint.fg }}
      aria-hidden={title ? undefined : 'true'}
      title={title}
    >
      {initialsOf(name)}
    </span>
  );

  if (!presence) return badge;
  return <span className={`presence presence-${presence}`}>{badge}</span>;
}

/* Avatar with a name and one line of context, used in tables and lists. */
export function Identity({ name, meta, size = 'sm', presence }) {
  return (
    <span className="identity">
      <Avatar name={name} size={size} presence={presence} />
      <span className="identity-text">
        <span className="identity-name">{name}</span>
        {meta ? <span className="identity-meta">{meta}</span> : null}
      </span>
    </span>
  );
}

export default Avatar;
