import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

function getInitials(name) {
  if (!name) return 'RM';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function ResidentProfileModal({ member, onClose, onStartChat }) {
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!member) return null;

  const fullName = `${member.first_name} ${member.last_name}`;
  const initials = getInitials(fullName);

  const isSelf = currentUser?.email === member.email;
  const isAdmin = userRole === 'Estate Administrator';
  const isVolunteer = userRole === 'Safety Volunteer';
  const isPeerResident = !isAdmin && !isVolunteer && !isSelf;

  // Masking helpers for peer residents
  const maskedEmail = member.email
    ? `${member.email[0]}•••••@${member.email.split('@')[1] || 'riverside.co.za'}`
    : '•••••@riverside.co.za';

  const maskedPhone = member.phone_number
    ? `${member.phone_number.substring(0, 7)} ••• ${member.phone_number.slice(-4)}`
    : '+27 82 ••• 0000';

  return (
    <Modal
      title="Verified Resident Profile"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Close Profile
          </button>
          {isAdmin ? (
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => {
                onClose();
                alert(`Account allocation tools opened for ${fullName}.`);
              }}
            >
              Manage Account Allocation
            </button>
          ) : onStartChat ? (
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => {
                onClose();
                onStartChat(member);
              }}
            >
              Send Message
            </button>
          ) : null}
        </>
      }
    >
      <div className="stack" style={{ gap: 'var(--s4)' }}>
        {/* Profile Masthead Header with Avatar & Close "✕" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--line)',
            paddingBottom: 'var(--s4)',
          }}
        >
          <div className="cluster" style={{ gap: 'var(--s3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--signal-wash)',
                border: '1px solid var(--signal)',
                color: 'var(--signal-hi)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div>
              <div className="cluster" style={{ gap: 'var(--s2)', marginBottom: '2px' }}>
                <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                  {fullName}
                </h2>
                <span
                  className="mono sm"
                  style={{
                    color: 'var(--signal)',
                    backgroundColor: 'var(--signal-wash)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    border: '1px solid var(--line-hi)',
                  }}
                >
                  {member.role || 'Resident'}
                </span>
              </div>

              <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                {member.address || 'Section A, Riverside Estate'} • Member since {member.joined_date || 'January 2025'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn"
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.9rem',
              borderColor: 'transparent',
              color: 'var(--dim)',
              cursor: 'pointer',
            }}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Verification & Household Summary */}
        <div style={{ paddingBottom: 'var(--s4)', borderBottom: '1px solid var(--line)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', marginBottom: 'var(--s2)' }}>
            Verification & Household Summary
          </p>
          <div className="fields" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)' }}>
            <div>
              <span className="faint sm">Verification Status</span>
              <p className="sm" style={{ color: 'var(--paper)', fontWeight: 500, marginTop: '2px' }}>
                Verified Household
              </p>
            </div>

            <div>
              <span className="faint sm">Estate Section</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {member.address ? member.address.split(',')[1] || 'Section A' : 'Section A'}
              </p>
            </div>

            {member.emergency_role ? (
              <div>
                <span className="faint sm">Estate Department / Team</span>
                <p className="sm" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                  {member.emergency_role}
                </p>
              </div>
            ) : null}

            <div>
              <span className="faint sm">Gatherings Attended</span>
              <p className="sm mono" style={{ color: 'var(--signal)', fontWeight: 600, marginTop: '2px' }}>
                {member.events_attended || 12} Events
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information (Masked for Peer Residents) */}
        <div style={{ paddingBottom: 'var(--s4)', borderBottom: isPeerResident ? 'none' : '1px solid var(--line)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', marginBottom: 'var(--s2)' }}>
            Contact & Communication
          </p>
          <div className="fields" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)' }}>
            <div>
              <span className="faint sm">Email Address</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {isPeerResident ? maskedEmail : member.email}
              </p>
            </div>

            <div>
              <span className="faint sm">Phone Number</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                {isPeerResident ? maskedPhone : (member.phone_number || '+27 82 459 1029')}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Registered Estate Assets & Vehicle Verification (Admins & Volunteers Only) */}
        {!isPeerResident ? (
          <div style={{ paddingBottom: 'var(--s4)', borderBottom: isAdmin ? '1px solid var(--line)' : 'none' }}>
            <p className="eyebrow" style={{ color: 'var(--signal)', marginBottom: 'var(--s2)' }}>
              Registered Vehicle & Security Verification
            </p>
            <div className="fields" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)' }}>
              <div>
                <span className="faint sm">Registered Vehicle & Plate</span>
                <p className="sm" style={{ color: 'var(--paper)', fontWeight: 500, marginTop: '2px' }}>
                  {member.household_vehicle || 'Silver Volkswagen Polo (AB 42 CD GP)'}
                </p>
              </div>

              {isAdmin ? (
                <div>
                  <span className="faint sm">Gate Access Keycard ID</span>
                  <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                    {member.gate_access_code || 'GATE-KEY-8841'}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Section 4: Emergency Access Notes (Admins Only) */}
        {isAdmin && member.emergency_notes ? (
          <div
            style={{
              padding: 'var(--s3) var(--s4)',
              backgroundColor: 'var(--panel-hi)',
              borderLeft: '3px solid var(--signal)',
              borderRadius: '4px',
            }}
          >
            <p className="eyebrow" style={{ color: 'var(--signal)', marginBottom: '2px' }}>
              Emergency Access Notes
            </p>
            <p className="sm faint" style={{ color: 'var(--paper)', margin: 0 }}>
              {member.emergency_notes}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default ResidentProfileModal;
