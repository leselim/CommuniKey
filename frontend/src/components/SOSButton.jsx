import React from 'react';

function SOSButton() {
  const handleSOS = () => {
    alert('Emergency SOS Signal Triggered! Security response dispatched.');
  };

  return (
    <button className="sos-button" onClick={handleSOS}>
      🚨 EMERGENCY SOS
    </button>
  );
}

export default SOSButton;
