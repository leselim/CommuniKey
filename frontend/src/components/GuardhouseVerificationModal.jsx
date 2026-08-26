import React, { useState } from 'react';
import Modal from './Modal';

const KNOWN_PASSES = {
  '492-801': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor - Plumbing)',
    host: 'Unit 14 (Thabo Molefe)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validUntil: 'Today, 18:00',
    status: 'VALID',
  },
  '492801': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor - Plumbing)',
    host: 'Unit 14 (Thabo Molefe)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validUntil: 'Today, 18:00',
    status: 'VALID',
  },
  'CK-492': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor - Plumbing)',
    host: 'Unit 14 (Thabo Molefe)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validUntil: 'Today, 18:00',
    status: 'VALID',
  },
  '108-942': {
    code: 'CK-108',
    pin: '108-942',
    visitor: 'Elena Rostova (Guest)',
    host: 'Unit 42 (Sarah Jenkins)',
    vehicle: 'CA 492 101 (Silver VW Polo)',
    validUntil: 'Tomorrow, 12:00',
    status: 'VALID',
  },
  '771-304': {
    code: 'CK-771',
    pin: '771-304',
    visitor: 'Kabelo Dlamini (Courier - DHL)',
    host: 'Unit 07 (Marcus Vance)',
    vehicle: 'NP 123 456 (Blue Hyundai H100)',
    validUntil: 'Today, 20:00',
    status: 'VALID',
  },
};

function GuardhouseVerificationModal({ isOpen, onClose, onLogEntry }) {
  const [accessCode, setAccessCode] = useState('');
  const [logStatus, setLogStatus] = useState('');

  if (!isOpen) return null;

  const cleanCode = accessCode.trim().toUpperCase();
  const matchedPass = KNOWN_PASSES[cleanCode] || KNOWN_PASSES[cleanCode.replace('-', '')];
  const isInputEntered = cleanCode.length >= 3;

  const handleLogTimestamp = () => {
    if (!matchedPass) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logMsg = `Gate entry logged for ${matchedPass.visitor} (${matchedPass.host}) at ${timeStr} by Guardhouse Terminal.`;
    setLogStatus(logMsg);
    if (onLogEntry) onLogEntry(logMsg);
  };

  return (
    <Modal
      title="Guardhouse Access Pass Verification"
      onClose={onClose}
      footer={
        <div className="cluster" style={{ width: '100%', justifyContent: 'space-between' }}>
          <button type="button" className="btn" onClick={onClose}>
            Close Terminal
          </button>
          {matchedPass ? (
            <button type="button" className="btn btn-solid" onClick={handleLogTimestamp}>
              Log Entry Timestamp
            </button>
          ) : null}
        </div>
      }
    >
      <div className="stack" style={{ gap: 'var(--s4)' }}>
        <p className="eyebrow" style={{ fontSize: '0.68rem', color: 'var(--dim)', margin: 0 }}>
          MAIN GUARDHOUSE ACCESS CONTROL TERMINAL
        </p>

        {/* Access Code Input */}
        <div>
          <label className="eyebrow" htmlFor="access-code-input" style={{ display: 'block', marginBottom: 'var(--s2)' }}>
            Enter 6-Digit Gate PIN or Pass Reference (e.g. 492-801 / CK-492)
          </label>
          <input
            id="access-code-input"
            type="text"
            className="control"
            placeholder="e.g. 492-801 or CK-492"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value);
              setLogStatus('');
            }}
            style={{
              fontSize: '1.1rem',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              fontWeight: 600,
              padding: 'var(--s3)',
              textTransform: 'uppercase',
            }}
            autoFocus
          />
        </div>

        {/* Real-time Verification Feedback */}
        {isInputEntered ? (
          matchedPass ? (
            <div
              style={{
                padding: 'var(--s4)',
                backgroundColor: 'var(--panel-hi)',
                borderLeft: '4px solid #10b981',
                borderRadius: '4px',
              }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  VALID • ENTRY PERMITTED
                </span>
                <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>
                  {matchedPass.code} ({matchedPass.pin})
                </span>
              </div>

              <div className="stack" style={{ gap: '4px', marginTop: 'var(--s2)', fontSize: '0.82rem' }}>
                <div>
                  <strong style={{ color: 'var(--paper)' }}>Visitor: </strong>
                  <span style={{ color: 'var(--paper)' }}>{matchedPass.visitor}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--paper)' }}>Destination Host: </strong>
                  <span style={{ color: 'var(--dim)' }}>{matchedPass.host}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--paper)' }}>Vehicle Registration: </strong>
                  <span className="mono" style={{ color: 'var(--dim)' }}>{matchedPass.vehicle}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--paper)' }}>Valid Until: </strong>
                  <span style={{ color: 'var(--dim)' }}>{matchedPass.validUntil}</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 'var(--s4)',
                backgroundColor: 'var(--panel-hi)',
                borderLeft: '4px solid #e11d48',
                borderRadius: '4px',
              }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#e11d48',
                    backgroundColor: 'rgba(225, 29, 72, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    border: '1px solid rgba(225, 29, 72, 0.3)',
                  }}
                >
                  EXPIRED / INVALID PASS
                </span>
              </div>
              <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0', fontSize: '0.78rem' }}>
                Access code "{cleanCode}" was not found in active gate ledger or has expired. Verify code with host resident.
              </p>
            </div>
          )
        ) : (
          <p className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.75rem', margin: 0 }}>
            Tip: Try testing with active demo pass PINs: <strong>492-801</strong>, <strong>108-942</strong>, or <strong>771-304</strong>.
          </p>
        )}

        {logStatus ? (
          <p className="notice" style={{ margin: 0, fontSize: '0.78rem', padding: 'var(--s2) var(--s3)' }}>
            {logStatus}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

export default GuardhouseVerificationModal;
