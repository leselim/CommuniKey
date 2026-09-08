import React from 'react';

/*
 * Wordmark. Typographic only - the name is the mark. The weight shift and
 * the colour change at "Key" carry the identity without needing a glyph
 * sitting next to it.
 */

function Logo({ className = '' }) {
  return (
    <span className={`wordmark-title ${className}`.trim()}>
      Communi<em>Key</em>
    </span>
  );
}

export default Logo;
