import React, { useState } from 'react';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import DataTable, { CellPerson, CellStack, CellTime } from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ResidentProfileModal from '../components/ResidentProfileModal';
import { Card, Details, EmptyState, SearchField, SectionBar, Toast } from '../components/ui';
import useCollection from '../hooks/useCollection';
import useApplications from '../services/applications';
import { members as demoMembers } from '../services/demoData';

function MemberModeration() {
  const { items: memberList } = useCollection('/members', demoMembers);

  const { applications: pendingQueue, decide } = useApplications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocModal, setSelectedDocModal] = useState(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);
  const [notice, setNotice] = useState('');

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice((current) => (current === message ? '' : current)), 4000);
  };

  const handleApprove = (id) => {
    decide(id);
    setSelectedDocModal(null);
    flash('Resident account verified and granted estate access.');
  };

  const handleDecline = (id) => {
    decide(id);
    setSelectedDocModal(null);
    flash('Resident application declined.');
  };

  const filteredMembers = memberList.filter((m) => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      m.first_name.toLowerCase().includes(term) ||
      m.last_name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.address && m.address.toLowerCase().includes(term))
    );
  });

  return (
    <div className="page">
      <SectionBar
        icon="userCheck"
        title="Members and approvals"
        stats={[
          { label: 'Awaiting verification:', value: pendingQueue.length },
          { label: 'Active households:', value: memberList.length },
        ]}
      />

      <Card
        title="Applications awaiting verification"
        sub="Check proof of residence against the resident register before granting access"
        flush
      >
        {pendingQueue.length === 0 ? (
          <EmptyState icon="checkCircle" title="All applications processed" text="New registrations will appear here for review." />
        ) : (
          <DataTable
            caption="Applications awaiting verification"
            columns={[
              {
                key: 'applicant',
                header: 'Applicant',
                stack: true,
                cell: (item) => <CellPerson name={item.name} meta={item.email} avatar={<Avatar name={item.name} size="sm" />} />,
              },
              { key: 'household', header: 'Household', width: '16%', cell: (item) => item.address },
              {
                key: 'document',
                header: 'Document',
                width: '18%',
                stack: true,
                cell: (item) => <CellStack title={item.documentType} sub={item.fileName} />,
              },
              { key: 'submitted', header: 'Submitted', width: '150px', cell: (item) => <CellTime>{item.uploadedTime}</CellTime> },
              { key: 'status', header: 'Status', width: '140px', cell: (item) => <StatusBadge status={item.status} /> },
              {
                key: 'actions',
                header: 'Actions',
                align: 'end',
                width: '292px',
                cell: (item) => (
                  <>
                    <button type="button" className="btn btn-sm" onClick={() => setSelectedDocModal(item)}>
                      <Icon name="eye" />
                      Review
                    </button>
                    <button type="button" className="btn btn-sm btn-danger-quiet" onClick={() => handleDecline(item.id)}>
                      Decline
                    </button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => handleApprove(item.id)}>
                      Approve
                    </button>
                  </>
                ),
              },
            ]}
            rows={pendingQueue}
          />
        )}
      </Card>

      <Card
        title="Household directory"
        sub={`${filteredMembers.length} verified ${filteredMembers.length === 1 ? 'member' : 'members'}`}
        flush
        actions={<SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search name, email or address" label="Search members" />}
      >
        {filteredMembers.length === 0 ? (
          <EmptyState icon="search" title="No members match that search" />
        ) : (
          <DataTable
            caption="Household directory"
            columns={[
              {
                key: 'member',
                header: 'Member',
                stack: true,
                cell: (m) => {
                  const name = `${m.first_name} ${m.last_name}`;
                  return <CellPerson name={name} meta={m.email} avatar={<Avatar name={name} size="sm" />} />;
                },
              },
              { key: 'address', header: 'Address', width: '28%', cell: (m) => m.address },
              { key: 'role', header: 'Role', width: '20%', cell: (m) => m.role },
              { key: 'status', header: 'Status', width: '140px', cell: (m) => <StatusBadge status={m.status} /> },
              {
                key: 'profile',
                header: null,
                srHeader: 'Open full profile',
                align: 'end',
                width: '150px',
                cell: (m) => (
                  <button type="button" className="btn btn-sm" onClick={() => setSelectedMemberProfile(m)}>
                    View full profile
                  </button>
                ),
              },
            ]}
            rows={filteredMembers}
          />
        )}
      </Card>

      {selectedDocModal ? (
        <Modal
          title="Review verification document"
          onClose={() => setSelectedDocModal(null)}
          footer={
            <>
              <button type="button" className="btn push" onClick={() => setSelectedDocModal(null)}>
                Close
              </button>
              <button type="button" className="btn btn-danger-quiet" onClick={() => handleDecline(selectedDocModal.id)}>
                Decline application
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleApprove(selectedDocModal.id)}>
                <Icon name="check" />
                Approve account
              </button>
            </>
          }
        >
          <div className="profile-head" style={{ paddingBottom: 14, borderBottom: '1px solid var(--line-soft)' }}>
            <Avatar name={selectedDocModal.name} size="lg" />
            <div>
              <span className="profile-name" style={{ fontSize: 'var(--fs-15)' }}>
                {selectedDocModal.name}
              </span>
              <div className="profile-tags">
                <StatusBadge status={selectedDocModal.status} />
              </div>
            </div>
          </div>

          <Details
            rows={[
              { label: 'Address', value: selectedDocModal.address },
              { label: 'Email', value: selectedDocModal.email },
              { label: 'Phone', value: selectedDocModal.phone },
              { label: 'Document type', value: selectedDocModal.documentType },
              { label: 'Uploaded', value: selectedDocModal.uploadedTime },
            ]}
          />

          <div className="waiting" style={{ marginTop: 12, minHeight: 130, flexDirection: 'column', gap: 6 }}>
            <Icon name="file" size={22} />
            <span className="strong ink-2">{selectedDocModal.fileName}</span>
            <span className="sm">Document ID and municipal record matched</span>
          </div>
        </Modal>
      ) : null}

      {selectedMemberProfile ? (
        <ResidentProfileModal member={selectedMemberProfile} onClose={() => setSelectedMemberProfile(null)} />
      ) : null}

      <Toast message={notice} />
    </div>
  );
}

export default MemberModeration;
