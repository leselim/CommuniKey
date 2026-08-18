import React, { useState, useEffect } from 'react';
import { MapPin, Users, CheckCircle2, Plus, Search, UserCheck, X } from 'lucide-react';
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
    city: 'Cape Town',
    suburb: 'Pinelands',
    province: 'Western Cape',
    postal_code: '7405',
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
        name: '', description: '', city: 'Cape Town', suburb: 'Pinelands', province: 'Western Cape', postal_code: '7405', community_type: 'RESIDENTIAL'
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

  const pinelandsSuburbs = ['All Pinelands', 'Howard Centre', 'Mutual Park', 'Champagne Pinelands', 'Pinelands Oval'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pinelands Community Networks</h1>
          <p className="page-subtitle">Residential security initiatives and neighborhood watches in Pinelands</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={15} /> Create Community
        </button>
      </div>

      {/* Search & Suburb Filter */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Pinelands community networks, streets, or sectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Sector Filter:</span>
          {pinelandsSuburbs.map((area) => {
            const isSelected = search === area || (area === 'All Pinelands' && !search);
            return (
              <button
                key={area}
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: '1px solid ' + (isSelected ? '#0f172a' : '#cbd5e1'),
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '16px',
                  fontWeight: isSelected ? '600' : '500'
                }}
                onClick={() => setSearch(area === 'All Pinelands' ? '' : area)}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>Loading directory...</div>
      ) : (
        <div className="grid-2">
          {communities.map((comm) => {
            const isActive = activeCommunity?.id === comm.id;
            return (
              <div
                key={comm.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  borderLeft: isActive ? '4px solid #1e40af' : '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-info">{comm.community_type}</span>
                    <span style={{ fontSize: '0.775rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#1e40af" /> {comm.suburb || 'Pinelands'}, {comm.city || 'Cape Town'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    {comm.name}
                  </h3>

                  {isActive && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                      <CheckCircle2 size={13} /> Active Selection
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>
                    {comm.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.775rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                    <Users size={13} color="#0f172a" /> {comm.member_count} Members
                  </span>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleOpenMembers(comm)} className="btn btn-secondary btn-sm">
                      <UserCheck size={13} /> Members
                    </button>

                    {comm.is_member ? (
                      <>
                        {!isActive && (
                          <button onClick={() => selectCommunity(comm)} className="btn btn-primary btn-sm">
                            Set Active
                          </button>
                        )}
                        <button onClick={() => handleLeave(comm.id)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626', borderColor: '#fecaca' }}>
                          Leave
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleJoin(comm.id)} className="btn btn-primary btn-sm">
                        Join Community
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Pinelands Community</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Community Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Pinelands Central Sector Watch"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newCommunity.community_type}
                  onChange={(e) => setNewCommunity({ ...newCommunity, community_type: e.target.value })}
                >
                  <option value="RESIDENTIAL">Residential Neighborhood Watch</option>
                  <option value="APARTMENT">Apartment Complex / Gated Estate</option>
                  <option value="CAMPUS">School / Campus Network</option>
                  <option value="BUSINESS">Business Improvement District</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe your sector's boundaries and goals..."
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newCommunity.city}
                    onChange={(e) => setNewCommunity({ ...newCommunity, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Suburb / Sector</label>
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
              <button onClick={() => setShowMembersModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}>
              {members.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>No members registered yet.</p>
              ) : (
                members.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '6px', marginBottom: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                        {m.user_detail?.first_name ? `${m.user_detail.first_name} ${m.user_detail.last_name || ''}` : m.user_detail?.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Role: <strong>{m.role}</strong> | Status: <strong style={{ color: m.status === 'APPROVED' ? '#16a34a' : '#d97706' }}>{m.status}</strong>
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
