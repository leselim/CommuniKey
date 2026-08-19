import React from 'react';

function Logo({ className = '' }) {
  return (
    <div className={`wordmark-brand ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span className="wordmark-title" style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#e9ecea' }}>
        Communi<span style={{ color: 'var(--signal, #d1462c)', fontWeight: 700 }}>Key</span>
      </span>
    </div>
  );
}

export default Logo;
