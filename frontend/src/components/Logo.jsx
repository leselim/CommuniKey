import React from 'react';

function Logo({ size = 28, showText = true, className = '' }) {
  return (
    <div className={`wordmark-brand ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="ck-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2573c" />
            <stop offset="100%" stopColor="#d1462c" />
          </linearGradient>
          <linearGradient id="ck-key-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e9ecea" />
          </linearGradient>
        </defs>

        {/* Shield / Key Base Contour */}
        <path
          d="M16 3L5 7V14C5 20.8 9.7 27.1 16 29C22.3 27.1 27 20.8 27 14V7L16 3Z"
          fill="url(#ck-logo-grad)"
          opacity="0.15"
        />

        <path
          d="M16 3L5 7V14C5 20.8 9.7 27.1 16 29C22.3 27.1 27 20.8 27 14V7L16 3Z"
          stroke="url(#ck-logo-grad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Central Key Icon Motif */}
        {/* Key Ring (Head) */}
        <circle cx="16" cy="11" r="3.5" stroke="url(#ck-key-ring)" strokeWidth="2" fill="none" />
        
        {/* Key Shaft */}
        <path d="M16 14.5V23" stroke="url(#ck-key-ring)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Key Teeth */}
        <path d="M16 18.5H19" stroke="url(#ck-key-ring)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 21.5H18.5" stroke="url(#ck-key-ring)" strokeWidth="2" strokeLinecap="round" />

        {/* Community Connectivity Nodes */}
        <circle cx="10" cy="12" r="1" fill="#e2573c" />
        <circle cx="22" cy="12" r="1" fill="#e2573c" />
      </svg>

      {showText && (
        <span className="wordmark-title" style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#e9ecea' }}>
          Communi<span style={{ color: 'var(--signal, #d1462c)', fontWeight: 700 }}>Key</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
