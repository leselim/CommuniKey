import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communityService } from '../services/api';

function Communities() {
  const { user, loadCommunities, selectCommunity, activeCommunity } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    city: '',
    suburb: '',
    province: '',
    postal_code: '',
    community_type: 'RESIDENTIAL'
  });

  useEffect(() => {
    fetchCommunities();
  }, [search]);

  const fetchCommunities = async () => {
    try {
      const res = await communityService.getCommunities({ search });
      const list = res.data?.results || res.data || [];
      setCommunities(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await communityService.createCommunity(newCommunity);
      const created = res.data?.data || res.data;
      setShowCreateModal(false);
      setNewCommunity({
        name: '', description: '', city: '', suburb: '', province: '', postal_code: '', community_type: 'RESIDENTIAL'
      });
      fetchCommunities();
      loadCommunities();
      selectCommunity(created);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create community.');
    }
  };

  const handleJoin = async (id) => {
    try {
      await communityService.joinCommunity(id);
      fetchCommunities();
      loadCommunities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeave = async (id) => {
    try {
      await communityService.leaveCommunity(id);
      fetchCommunities();
      loadCommunities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMembers = async (comm) => {
    setShowMembersModal(comm);
    try {
      const res = await communityService.getMembers(comm.id);
      setMembers(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveMember = async (commId, membershipId, action) => {
    try {
      await communityService.approveMember(commId, membershipId, action);
      const res = await communityService.getMembers(commId);
      setMembers(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Hub</h1>
          <p className="page-subtitle">Discover, join, or manage residential & local communities</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          + Create New Community
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by community name, city, or suburb..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading communities...</p>
      ) : (
        <div className="grid-2">
          {communities.map((comm) => (
            <div key={comm.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-info">{comm.community_type}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {comm.city}, {comm.suburb}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  {comm.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '16px' }}>
                  {comm.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  👥 {comm.member_count} active members
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenMembers(comm)} className="btn btn-secondary btn-sm">
                    Members
                  </button>

                  {comm.is_member ? (
                    <button onClick={() => handleLeave(comm.id)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}>
                      Leave
                    </button>
                  ) : (
                    <button onClick={() => handleJoin(comm.id)} className="btn btn-primary btn-sm">
                      Join Community
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Community</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Community Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Community Type</label>
                <select
                  className="form-select"
                  value={newCommunity.community_type}
                  onChange={(e) => setNewCommunity({ ...newCommunity, community_type: e.target.value })}
                >
                  <option value="RESIDENTIAL">Residential Neighborhood</option>
                  <option value="APARTMENT">Apartment Complex / Estate</option>
                  <option value="CAMPUS">University / Campus</option>
                  <option value="VILLAGE">Village / Rural Area</option>
                  <option value="BUSINESS">Business Park / District</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newCommunity.city}
                    onChange={(e) => setNewCommunity({ ...newCommunity, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Suburb</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCommunity.suburb}
                    onChange={(e) => setNewCommunity({ ...newCommunity, suburb: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Members - {showMembersModal.name}</h3>
              <button onClick={() => setShowMembersModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {members.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No members registered yet.</p>
              ) : (
                members.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {m.user_detail?.first_name ? `${m.user_detail.first_name} ${m.user_detail.last_name || ''}` : m.user_detail?.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Role: {m.role} | Status: <strong style={{ color: m.status === 'APPROVED' ? '#16a34a' : '#d97706' }}>{m.status}</strong>
                      </div>
                    </div>

                    {user?.id === showMembersModal.created_by && m.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleApproveMember(showMembersModal.id, m.id, 'approve')} className="btn btn-primary btn-sm">
                          Approve
                        </button>
                        <button onClick={() => handleApproveMember(showMembersModal.id, m.id, 'reject')} className="btn btn-secondary btn-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communities;
