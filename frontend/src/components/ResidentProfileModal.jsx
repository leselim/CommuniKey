import React from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Avatar from './Avatar';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { Details } from './ui';

/*
 * Resident profile.
 *
 * What a viewer sees depends on who they are. Another resident sees a
 * neighbour's name and street with contact details partly masked. An
 * administrator sees the full record. A masked value is still shown as
 * data, so the viewer knows something is there that they cannot see.
 */

function ResidentProfileModal({ member, onClose, onStartChat }) {
  const { currentUser, userRole } = useAuth();

  if (!member) return null;

  const fullName = `${member.first_name} ${member.last_name}`;

  const isSelf = currentUser?.email === member.email;
  const isAdmin = userRole === 'Estate Administrator';
  const isVolunteer = userRole === 'Safety Volunteer';
  const isPeerResident = !isAdmin && !isVolunteer && !isSelf;

  const isManagement = member.role === 'Community Administrator' || member.role === 'Estate Administrator';
  const isSecurity = member.role === 'Security Guard' || member.role === 'Security Patrol';

  const modalTitle = isManagement ? 'Estate management' : isSecurity ? 'Estate staff' : 'Resident';
  const accountTypeLabel = isManagement ? 'Verified management' : isSecurity ? 'Verified security' : 'Verified resident';
  const assignedArea = member.address || (isManagement ? '1 Clubhouse Way, Section A' : 'Section A, Riverside Estate');

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
      <button type="button" className="btn btn-primary" onClick={onClose}>
        Manage account
      </button>
    );
  } else if (onStartChat && !isSelf) {
    footerAction = (
      <button
        type="button"
        className="btn btn-primary"
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
    <Modal
      title={modalTitle}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          {footerAction}
        </>
      }
    >
      <div className="profile-head" style={{ paddingBottom: 14, borderBottom: '1px solid var(--line-soft)' }}>
        <Avatar name={fullName} size="xl" />
        <div>
          <span className="profile-name">{fullName}</span>
          <div className="profile-tags">
            <StatusBadge status="Verified" />
            <span className="pill pill-plain">{member.role || 'Resident'}</span>
          </div>
        </div>
      </div>

      <Details
        rows={[
          { label: 'Account type', value: accountTypeLabel },
          { label: 'Address', value: assignedArea },
          { label: 'Member since', value: member.joined_date || 'January 2024' },
          { label: 'Email', value: emailValue, masked: isPeerResident },
          { label: 'Phone', value: phoneValue, masked: isPeerResident },
          !isPeerResident && member.household_vehicle
            ? { label: 'Registered vehicle', value: member.household_vehicle }
            : null,
          isAdmin && member.gate_access_code ? { label: 'Gate keycard', value: member.gate_access_code, masked: true } : null,
        ]}
      />

      {isPeerResident ? (
        <div className="alert alert-info" style={{ marginTop: 12 }}>
          <Icon name="lock" />
          <span>Contact details are partly hidden from other residents. Estate management can see the full record.</span>
        </div>
      ) : null}

      {isAdmin && member.emergency_notes ? (
        <div className="alert alert-info" style={{ marginTop: 12 }}>
          <Icon name="info" />
          <span>
            <strong style={{ display: 'block', color: 'var(--ink)' }}>Emergency access notes</strong>
            {member.emergency_notes}
          </span>
        </div>
      ) : null}
    </Modal>
  );
}

export default ResidentProfileModal;
