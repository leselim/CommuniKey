import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';

/*
 * Resident profile.
 *
 * What a viewer sees depends on who they are. Another resident sees a
 * neighbour's name and street, with contact details partly masked; an
 * administrator sees the full record. The masking is shown honestly - a
 * masked value is styled as data, not hidden away, so the viewer knows
 * there is something there they cannot see.
 */

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

  const isSelf = currentUser?.email === member.email;
  const isAdmin = userRole === 'Estate Administrator';
  const isVolunteer = userRole === 'Safety Volunteer';
  const isPeerResident = !isAdmin && !isVolunteer && !isSelf;

  const isManagement =
    member.role === 'Community Administrator' || member.role === 'Estate Administrator';
  const isSecurity = member.role === 'Security Guard' || member.role === 'Security Patrol';

  const modalTitle = isManagement
    ? 'Estate management'
    : isSecurity
    ? 'Estate staff'
    : 'Resident';

  const accountTypeLabel = isManagement
    ? 'Verified management'
    : isSecurity
    ? 'Verified security'
    : 'Verified resident';

  const assignedArea =
    member.address || (isManagement ? '1 Clubhouse Way, Section A' : 'Section A, Riverside Estate');

  const maskedEmail = member.email
    ? `${member.email[0]}\u2022\u2022\u2022\u2022\u2022@${member.email.split('@')[1] || 'riverside.co.za'}`
    : '\u2022\u2022\u2022\u2022\u2022@riverside.co.za';

  const maskedPhone = member.phone_number
    ? `${member.phone_number.substring(0, 7)} \u2022\u2022\u2022 ${member.phone_number.slice(-4)}`
    : '+27 82 \u2022\u2022\u2022 2020';

  const emailValue = isPeerResident ? maskedEmail : member.email || maskedEmail;
  const phoneValue = isPeerResident ? maskedPhone : member.phone_number || maskedPhone;

  let footerAction = null;
  if (isAdmin && !isSelf) {
    footerAction = (
      <button type="button" className="btn btn-solid" onClick={onClose}>
        Manage account
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
        Send a message
      </button>
    );
  }

  return (
    <Modal title={modalTitle} onClose={onClose} footer={footerAction}>
      <div className="profile-head">
        <Avatar name={fullName} size="xl" ring />
        <div className="profile-id">
          <span className="profile-name">{fullName}</span>
          <div className="profile-tags">
            <StatusBadge status="Verified" />
            <span className="chip chip-plain">{member.role || 'Resident'}</span>
          </div>
        </div>
      </div>

      <div className="details" style={{ marginTop: 'var(--s4)' }}>
        <div className="details-row">
          <span className="details-label">Account type</span>
          <span className="details-value">{accountTypeLabel}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Address</span>
          <span className="details-value">{assignedArea}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Member since</span>
          <span className="details-value">{member.joined_date || 'January 2024'}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Email</span>
          <span className={`details-value${isPeerResident ? ' masked' : ''}`}>{emailValue}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Phone</span>
          <span className={`details-value${isPeerResident ? ' masked' : ''}`}>{phoneValue}</span>
        </div>

        {!isPeerResident && member.household_vehicle ? (
          <div className="details-row">
            <span className="details-label">Registered vehicle</span>
            <span className="details-value">{member.household_vehicle}</span>
          </div>
        ) : null}

        {isAdmin && member.gate_access_code ? (
          <div className="details-row">
            <span className="details-label">Gate keycard</span>
            <span className="details-value masked">{member.gate_access_code}</span>
          </div>
        ) : null}
      </div>

      {isPeerResident ? (
        <p className="hint" style={{ marginTop: 'var(--s4)' }}>
          Contact details are partly hidden from other residents. Estate management can see the
          full record.
        </p>
      ) : null}

      {isAdmin && member.emergency_notes ? (
        <div className="notice" style={{ marginTop: 'var(--s4)' }}>
          <strong style={{ display: 'block', marginBottom: '2px' }}>Emergency access notes</strong>
          {member.emergency_notes}
        </div>
      ) : null}
    </Modal>
  );
}

export default ResidentProfileModal;
