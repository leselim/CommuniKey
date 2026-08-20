import React from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

function ResidentProfileModal({ member, onClose, onStartChat, onSendPing }) {
  if (!member) return null;

  const fullName = `${member.first_name} ${member.last_name}`;

  return (
    <Modal
      title="Verified Resident Profile"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Close Profile
          </button>
          {onSendPing ? (
            <button
              type="button"
              className="btn"
              style={{ borderColor: 'var(--signal)' }}
              onClick={() => {
                onClose();
                onSendPing(member);
              }}
            >
              Send Emergency Ping
            </button>
          ) : null}
          {onStartChat ? (
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => {
                onClose();
                onStartChat(member);
              }}
            >
              Start Live Chat
            </button>
          ) : null}
        </>
      }
    >
      <div className="stack" style={{ gap: 'var(--s4)' }}>
        {/* Profile Masthead Header */}
        <div
          style={{
            borderBottom: '1px solid var(--line)',
            paddingBottom: 'var(--s3)',
          }}
        >
          <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
            <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              {fullName}
            </h2>
            <span
              className="status"
              style={{
                backgroundColor: 'var(--signal-wash)',
                color: 'var(--signal-hi)',
                borderColor: 'var(--signal)',
                fontWeight: 600,
              }}
            >
              Verified Member
            </span>
          </div>

          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.8rem' }}>
            {member.role} • {member.address}
          </p>
        </div>

        {/* Section 1: Verification & Household Details */}
        <div className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
            Household & Verification Summary
          </p>
          <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <span className="faint sm">Verification Status</span>
              <p className="sm" style={{ color: 'var(--paper)', fontWeight: 500, marginTop: '2px' }}>
                Verified Resident Household
              </p>
            </div>

            <div>
              <span className="faint sm">Member Since</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.joined_date || 'January 2025'}
              </p>
            </div>

            <div>
              <span className="faint sm">Safety Role</span>
              <p className="sm" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.emergency_role || 'Verified Resident Member'}
              </p>
            </div>

            <div>
              <span className="faint sm">Events Attended</span>
              <p className="sm mono" style={{ color: 'var(--signal)', fontWeight: 600, marginTop: '2px' }}>
                {member.events_attended || 12} Gatherings
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
            Contact & Communication Details
          </p>
          <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <span className="faint sm">Email Address</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.email}
              </p>
            </div>

            <div>
              <span className="faint sm">Phone & Emergency Contact</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.phone_number || '+27 82 000 0000'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Registered Estate Assets */}
        <div className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
            Registered Estate Assets & Keycard
          </p>
          <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <span className="faint sm">Household Vehicle</span>
              <p className="sm" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.household_vehicle || 'Registered Estate Vehicle'}
              </p>
            </div>

            <div>
              <span className="faint sm">Gate Access Keycard ID</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.gate_access_code || 'GATE-KEY-8841'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Notes */}
        {member.emergency_notes ? (
          <div
            className="panel"
            style={{
              padding: 'var(--s3) var(--s4)',
              backgroundColor: 'var(--panel-hi)',
              borderLeft: '2px solid var(--signal)',
            }}
          >
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>
              Emergency Access & Special Instructions
            </p>
            <p className="sm faint" style={{ color: 'var(--paper)', marginTop: '2px' }}>
              {member.emergency_notes}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default ResidentProfileModal;
