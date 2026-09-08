import React from 'react';

/*
 * Monogram avatar.
 *
 * There are no uploaded photos in this system, so the avatar has to carry
 * identity on its own. Each person gets a tint derived from their name, so
 * the same person is always the same colour everywhere in the app and a
 * directory reads as a set of distinct people rather than a grey column.
 *
 * The tints are all desaturated members of the estate-blue family plus two
 * neutral companions, so a directory stays calm and the accent blue keeps
 * its meaning elsewhere in the interface.
 */

const TINTS = [
  { bg: 'rgba(59, 106, 156, 0.20)', fg: '#9dc0e4' },
  { bg: 'rgba(88, 122, 138, 0.20)', fg: '#a6c3cd' },
  { bg: 'rgba(110, 118, 150, 0.20)', fg: '#b3b8d6' },
  { bg: 'rgba(74, 130, 122, 0.20)', fg: '#9ccdc4' },
  { bg: 'rgba(140, 128, 110, 0.20)', fg: '#d2c6b0' },
  { bg: 'rgba(120, 106, 140, 0.20)', fg: '#c4b4d4' },
];

export function initialsOf(name) {
  if (!name) return '··';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '··';
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

function Avatar({
  name,
  size = 'md',
  ring = false,
  live = false,
  presence,
  className = '',
  title,
}) {
  const tint = tintFor(name);
  const sizeClass = size === 'md' ? '' : `avatar-${size}`;
  const ringClass = live ? 'avatar-ring-live' : ring ? 'avatar-ring' : '';

  const badge = (
    <span
      className={`avatar ${sizeClass} ${ringClass} ${className}`.replace(/\s+/g, ' ').trim()}
      style={{ backgroundColor: tint.bg, color: tint.fg }}
      aria-hidden={title ? undefined : 'true'}
      title={title}
    >
      {initialsOf(name)}
    </span>
  );

  if (!presence) return badge;

  return (
    <span className={`presence presence-${presence}`}>
      {badge}
    </span>
  );
}

/* Avatar plus name and a line of context - used in directories and rows. */
export function Identity({ name, meta, size = 'sm', presence, live, end }) {
  return (
    <span className="identity">
      <Avatar name={name} size={size} presence={presence} live={live} />
      <span className="identity-text">
        <span className="identity-name">{name}</span>
        {meta ? <span className="identity-meta">{meta}</span> : null}
      </span>
      {end ? <span className="person-row-end">{end}</span> : null}
    </span>
  );
}

export default Avatar;
