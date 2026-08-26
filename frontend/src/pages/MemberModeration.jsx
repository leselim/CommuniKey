import React, { useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ResidentProfileModal from '../components/ResidentProfileModal';
import useCollection from '../hooks/useCollection';
import { members as demoMembers } from '../services/demoData';

const INITIAL_PENDING = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    phone: '+27 82 888 1234',
    documentType: 'Municipal Water Bill',
    fileName: 'WaterBill_29MillRd_Aug2026.pdf',
    uploadedTime: 'Yesterday at 16:40',
    status: 'Pending Review',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    phone: '+27 83 999 5678',
    documentType: 'Lease Agreement',
    fileName: 'Lease_5RiversideDr_2026.pdf',
    uploadedTime: '2 days ago at 11:15',
    status: 'Pending Review',
  },
];

function MemberModeration() {
  const { items: memberList } = useCollection('/members', demoMembers);

  const [pendingQueue, setPendingQueue] = useState(INITIAL_PENDING);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocModal, setSelectedDocModal] = useState(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);
  const [notice, setNotice] = useState('');

  const handleApprove = (id) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== id));
    setSelectedDocModal(null);
    setNotice('Resident account verified and granted estate access.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDecline = (id) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== id));
    setSelectedDocModal(null);
    setNotice('Resident application declined.');
    setTimeout(() => setNotice(''), 4000);
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
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* Masthead Header */}
      <header className="masthead">
        <div>
          <p className="eyebrow">
            Estate Administration
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>Member Moderation & Approvals</h1>
          <p className="masthead-meta" style={{ marginTop: 'var(--s2)' }}>
            Review pending resident verification documents, approve household accounts, and manage the estate directory.
          </p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* Pending Resident Registrations Panel */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              PENDING VERIFICATION QUEUE
            </p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Applications Awaiting Document Verification ({pendingQueue.length})
            </h2>
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <p className="blank">All resident verification applications processed.</p>
        ) : (
          <ul className="ledger">
            {pendingQueue.map((item) => (
              <li
                className="entry"
                key={item.id}
                style={{ display: 'block', padding: 'var(--s4) 0', borderBottom: '1px solid var(--line-hi)' }}
              >
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                      {item.name}
                    </h3>
                    <p className="sm faint" style={{ color: 'var(--dim)', margin: '2px 0 0 0' }}>
                      {item.address} • {item.email}
                    </p>
                  </div>
                  <div className="cluster" style={{ gap: 'var(--s2)' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedDocModal(item)}
                    >
                      Review Document
                    </button>
                    <button
                      type="button"
                      className="btn btn-solid"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve Account
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderColor: 'var(--line-hi)' }}
                      onClick={() => handleDecline(item.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
                <p className="sm faint" style={{ color: 'var(--paper)', margin: 0 }}>
                  Uploaded Document: <strong>{item.documentType}</strong> ({item.fileName}) • Submitted {item.uploadedTime}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Verified Resident Directory & Search Panel */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div
          className="panel-head"
          style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <div>
            <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              VERIFIED RESIDENT ROSTER
            </p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Active Household Directory ({filteredMembers.length})
            </h2>
          </div>
          <div style={{ width: '260px' }}>
            <input
              type="search"
              className="control"
              placeholder="Search resident name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            />
          </div>
        </div>

        <ul className="ledger">
          {filteredMembers.map((m) => (
            <li
              className="entry"
              key={m.id}
              style={{ display: 'block', padding: 'var(--s3) 0', borderBottom: '1px solid var(--line-hi)' }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                    {m.first_name} {m.last_name}
                  </h3>
                  <p className="sm faint" style={{ color: 'var(--dim)', margin: '2px 0 0 0' }}>
                    {m.address} • {m.role}
                  </p>
                </div>
                <div className="cluster" style={{ gap: 'var(--s2)' }}>
                  <StatusBadge status={m.status} />
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                    onClick={() => setSelectedMemberProfile(m)}
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Review Document Modal */}
      {selectedDocModal ? (
        <Modal
          title={`Review Verification Document (${selectedDocModal.name})`}
          onClose={() => setSelectedDocModal(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setSelectedDocModal(null)}>
                Close Preview
              </button>
              <button
                type="button"
                className="btn"
                style={{ borderColor: 'var(--line-hi)' }}
                onClick={() => handleDecline(selectedDocModal.id)}
              >
                Decline Application
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => handleApprove(selectedDocModal.id)}
              >
                Approve Account
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Resident Name:</strong> {selectedDocModal.name}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Address:</strong> {selectedDocModal.address}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Document Type:</strong> {selectedDocModal.documentType} ({selectedDocModal.fileName})
              </p>
              <p className="mono sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                Uploaded: {selectedDocModal.uploadedTime}
              </p>
            </div>

            <div
              style={{
                height: '140px',
                border: '1px dashed var(--line-hi)',
                backgroundColor: 'var(--ink)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <p className="sm faint" style={{ color: 'var(--dim)' }}>
                Preview of {selectedDocModal.fileName}
                <br />
                (Document ID & Municipal Match Verified)
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Resident Profile Modal */}
      {selectedMemberProfile ? (
        <ResidentProfileModal
          member={selectedMemberProfile}
          onClose={() => setSelectedMemberProfile(null)}
        />
      ) : null}
    </div>
  );
}

export default MemberModeration;
