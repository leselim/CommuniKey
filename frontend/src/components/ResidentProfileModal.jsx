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

  // Dynamic Modal Title
  const getModalTitle = (role) => {
    if (role === 'Community Administrator' || role === 'Estate Administrator') return 'Estate Admin Profile';
    if (role === 'Security Guard' || role === 'Security Patrol') return 'Staff Profile';
    return 'Resident Profile';
  };

  const modalTitle = getModalTitle(member.role);

  const accountTypeLabel =
    member.role === 'Community Administrator' || member.role === 'Estate Administrator'
      ? 'Verified Management'
      : member.role === 'Security Guard' || member.role === 'Security Patrol'
      ? 'Verified Security'
      : 'Verified Resident';

  const assignedArea = member.address
    ? member.address
    : member.role === 'Community Administrator' || member.role === 'Estate Administrator'
    ? '1 Clubhouse Way, Section A'
    : 'Section A, Riverside Estate';

  // Masking helpers for peer residents
  const maskedEmail = member.email
    ? `${member.email[0]}•••••@${member.email.split('@')[1] || 'riverside.co.za'}`
    : 'm•••••@riverside.co.za';

  const maskedPhone = member.phone_number
    ? `${member.phone_number.substring(0, 7)} ••• ${member.phone_number.slice(-4)}`
    : '+27 82 ••• 2020';

  const displayEmail = isPeerResident ? maskedEmail : (member.email || 'm•••••@riverside.co.za');
  const displayPhone = isPeerResident ? maskedPhone : (member.phone_number || '+27 82 ••• 2020');

  // Single Action Footer
  let footerAction = null;
  if (isAdmin) {
    footerAction = (
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
    );
  } else if (onStartChat && !isSelf) {
    footerAction = (
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
    );
  }

  return (
    <Modal title={modalTitle} onClose={onClose} footer={footerAction}>
      <div className="stack" style={{ gap: 'var(--s4)' }}>
        {/* Avatar & Headline Roster */}
        <div className="cluster" style={{ gap: 'var(--s3)', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--panel-hi)',
              border: '1px solid var(--line-hi)',
              color: 'var(--paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <div className="cluster" style={{ gap: 'var(--s2)', alignItems: 'center', marginBottom: '2px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                {fullName}
              </h2>
              <span
                style={{
                  color: 'var(--paper)',
                  backgroundColor: 'var(--panel-hi)',
                  border: '1px solid var(--line-hi)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                }}
              >
                {member.role || 'Resident'}
              </span>
            </div>

            <p className="sm faint" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.78rem' }}>
              {assignedArea} · Member since {member.joined_date || 'Jan 2024'}
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--line-hi)' }} />

        {/* Clean 2-Column Data View (Zero Fluff) */}
        <div className="fields" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--s4) var(--s3)' }}>
          <div>
            <span className="faint sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Account Type</span>
            <p className="sm" style={{ color: 'var(--paper)', fontWeight: 500, marginTop: '2px', margin: 0 }}>
              {accountTypeLabel}
            </p>
          </div>

          <div>
            <span className="faint sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Assigned Area</span>
            <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px', margin: 0 }}>
              {assignedArea}
            </p>
          </div>

          <div>
            <span className="faint sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Direct Email</span>
            <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px', margin: 0 }}>
              {displayEmail}
            </p>
          </div>

          <div>
            <span className="faint sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Emergency Contact</span>
            <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px', margin: 0 }}>
              {displayPhone}
            </p>
          </div>

          {!isPeerResident && member.household_vehicle ? (
            <div>
              <span className="faint sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Registered Vehicle</span>
              <p className="sm" style={{ color: 'var(--paper)', fontWeight: 500, marginTop: '2px', margin: 0 }}>
                {member.household_vehicle}
              </p>
            </div>
          ) : null}

          {!isPeerResident && isAdmin && member.gate_access_code ? (
            <div>
              <span className="faint sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Gate Keycard ID</span>
              <p className="sm mono" style={{ color: 'var(--paper)', marginTop: '2px', margin: 0 }}>
                {member.gate_access_code}
              </p>
            </div>
          ) : null}
        </div>

        {/* Emergency Access Notes (Admins Only) */}
        {isAdmin && member.emergency_notes ? (
          <div
            style={{
              padding: 'var(--s3) var(--s4)',
              backgroundColor: 'var(--panel-hi)',
              borderLeft: '3px solid var(--signal)',
              borderRadius: '4px',
              marginTop: 'var(--s2)',
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
