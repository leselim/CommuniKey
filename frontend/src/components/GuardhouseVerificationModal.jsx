import React, { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';

const KNOWN_PASSES = {
  '492-801': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor, plumbing)',
    host: 'Unit 14 (Thabo Molefe)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validUntil: 'Today, 18:00',
    status: 'VALID',
  },
  '492801': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor, plumbing)',
    host: 'Unit 14 (Thabo Molefe)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validUntil: 'Today, 18:00',
    status: 'VALID',
  },
  'CK-492': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor, plumbing)',
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
    visitor: 'Kabelo Dlamini (Courier, DHL)',
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
    const logMsg = `Gate entry logged for ${matchedPass.visitor} (${matchedPass.host}) at ${timeStr}.`;
    setLogStatus(logMsg);
    if (onLogEntry) onLogEntry(logMsg);
  };

  return (
    <Modal
      title="Verify a gate pass"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn push" onClick={onClose}>
            Close
          </button>
          {matchedPass ? (
            <button type="button" className="btn btn-primary" onClick={handleLogTimestamp}>
              <Icon name="clock" />
              Log entry time
            </button>
          ) : null}
        </>
      }
    >
      <div className="field">
        <label htmlFor="access-code-input">Gate PIN or pass reference</label>
        <input
          id="access-code-input"
          type="text"
          className="control control-xl"
          placeholder="492-801 or CK-492"
          value={accessCode}
          onChange={(e) => {
            setAccessCode(e.target.value);
            setLogStatus('');
          }}
          data-autofocus
          autoComplete="off"
        />
        {!isInputEntered ? (
          <span className="hint">Passes active today: 492-801, 108-942 and 771-304.</span>
        ) : null}
      </div>

      {isInputEntered ? (
        matchedPass ? (
          <div className="verdict verdict-ok" style={{ marginTop: 14 }}>
            <div className="verdict-head">
              <span className="row">
                <Icon name="checkCircle" />
                Valid pass, entry permitted
              </span>
              <span className="sm">
                {matchedPass.code} / {matchedPass.pin}
              </span>
            </div>
            <div className="verdict-body">
              <dl className="verdict-grid">
                <div>
                  <dt>Visitor</dt>
                  <dd>{matchedPass.visitor}</dd>
                </div>
                <div>
                  <dt>Visiting</dt>
                  <dd>{matchedPass.host}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{matchedPass.vehicle}</dd>
                </div>
                <div>
                  <dt>Valid until</dt>
                  <dd>{matchedPass.validUntil}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="verdict verdict-bad" style={{ marginTop: 14 }}>
            <div className="verdict-head">
              <span className="row">
                <Icon name="x_circle" />
                Expired or invalid pass
              </span>
            </div>
            <div className="verdict-body ink-2">
              No active pass matches {cleanCode}. Confirm the code with the resident who issued it.
            </div>
          </div>
        )
      ) : null}

      {logStatus ? (
        <div className="alert alert-ok" style={{ marginTop: 12 }}>
          <Icon name="checkCircle" />
          <span>{logStatus}</span>
        </div>
      ) : null}
    </Modal>
  );
}

export default GuardhouseVerificationModal;
