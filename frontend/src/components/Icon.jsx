import React from 'react';

/*
 * Line icons.
 *
 * A small, fixed set drawn on a 24 unit grid with a 1.8 stroke, so every
 * icon in the product has the same weight and corner treatment. Icons only
 * ever sit next to a label or carry an accessible name; they never stand in
 * for words on their own.
 */

const circle = (cx, cy, r) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  alert: 'M10.3 3.9 2.4 17.5a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  megaphone: 'M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1zM16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13',
  calendar: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 3v4M16 3v4',
  users: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2${circle(9, 7, 4)}M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8`,
  chart: 'M3 3v18h18M8 17v-5M13 17V8M18 17v-8',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  route: `${circle(6, 19, 2.5)}${circle(18, 5, 2.5)}M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5`,
  userCheck: `M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2${circle(8.5, 7, 4)}M16 11l2 2 4-4`,
  gate: 'M4 21V8h4v13M3 21h6M8 11h12a1.5 1.5 0 0 1 0 3H8M12 11l-1.5 3M16.5 11 15 14',
  key: `${circle(8, 15, 4)}M10.8 12.2 21 2M16 7l3 3M18.5 4.5l2 2`,
  search: `${circle(11, 11, 7)}M20 20l-3.5-3.5`,
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  help: `${circle(12, 12, 9.5)}M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01`,
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  chevronUp: 'M6 15l6-6 6 6',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  chevronLeft: 'm15 18-6-6 6-6',
  x: 'M18 6 6 18M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2M14 18h2v2M18 18h2v2h-2z',
  phone:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  check: 'M20 6 9 17l-5-5',
  checkCircle: `${circle(12, 12, 9.5)}M8 12l3 3 5-6`,
  clock: `${circle(12, 12, 9.5)}M12 7v5l3 2`,
  mapPin: `M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z${circle(12, 9.5, 2.5)}`,
  user: `M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2${circle(12, 7, 4)}`,
  repeat: 'M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3',
  menu: 'M4 6h16M4 12h16M4 18h16',
  siren: 'M7 18v-6a5 5 0 0 1 10 0v6M4 21h16v-3H4zM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4',
  ticket: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6zM14 5v14',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  info: `${circle(12, 12, 9.5)}M12 16v-4M12 8h.01`,
  eye: `M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z${circle(12, 12, 3)}`,
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  list: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM21 6l-9 7-9-7',
  car: `M5 17H3v-5l2-5h14l2 5v5h-2M5 12h14${circle(7.5, 17, 2)}${circle(16.5, 17, 2)}M9.5 17h5`,
  x_circle: `${circle(12, 12, 9.5)}M15 9l-6 6M9 9l6 6`,
};

function Icon({ name, className = '', title, size }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      focusable="false"
      style={size ? { width: size, height: size } : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}

export default Icon;
