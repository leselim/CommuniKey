import React from 'react';

/*
 * Wordmark with a keyhole mark. The keyhole is the product in one shape:
 * access to a shared place, held by the people who live there.
 * The name is a single text node so it reads and copies as one word.
 */

function Logo({ dark = false, className = '' }) {
  return (
    <span className={`logo${dark ? ' logo-dark' : ''} ${className}`.trim()}>
      <svg viewBox="0 0 26 26" aria-hidden="true" focusable="false">
        <rect width="26" height="26" rx="6.5" fill="#BE1E2D" />
        <circle cx="13" cy="10.6" r="3.3" fill="#fff" />
        <path d="M11.3 12.4h3.4l.9 6.1h-5.2z" fill="#fff" />
      </svg>
      <span>CommuniKey</span>
    </span>
  );
}

export default Logo;
