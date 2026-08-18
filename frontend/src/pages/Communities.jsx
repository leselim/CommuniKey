import React, { useState, useEffect } from 'react';
import { MapPin, Users, CheckCircle2, Plus, Search, ShieldCheck, UserCheck, X } from 'lucide-react';
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
          <h1 className="page-title">Community Directory & Networks</h1>
          <p className="page-subtitle">Discover, join, or manage residential neighborhoods and local safety initiatives</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={16} /> Create Community Network
        </button>
      </div>

      {/* Search & Suburb Filter */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by community name, city, or suburb (e.g. Pinelands, Rondebosch, Cape Town)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '44px', paddingRight: '14px', height: '48px', fontSize: '0.95rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: '600' }}>Quick Area Filter:</span>
          {['All Areas', 'Pinelands', 'Rondebosch', 'Woodstock', 'Sea Point', 'Century City'].map((area) => {
            const isSelected = search === area || (area === 'All Areas' && !search);
            return (
              <button
                key={area}
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  padding: '5px 14px',
                  fontSize: '0.775rem',
                  borderRadius: '20px',
                  fontWeight: isSelected ? '600' : '500'
                }}
                onClick={() => setSearch(area === 'All Areas' ? '' : area)}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading community directory...</div>
      ) : (
        <div className="grid-2">
          {communities.map((comm) => {
            const isActive = activeCommunity?.id === comm.id;
            return (
              <div
                key={comm.id}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: isActive ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  boxShadow: isActive ? '0 0 16px rgba(2, 132, 199, 0.2)' : 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className="badge badge-info">{comm.community_type}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <MapPin size={14} color="#0284c7" /> {comm.city}, {comm.suburb}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                    {comm.name}
                  </h3>

                  {isActive && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', marginBottom: '10px' }}>
                      <CheckCircle2 size={14} /> Selected Active Community
                    </div>
                  )}

                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '18px' }}>
                    {comm.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.825rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                    <Users size={14} color="#0284c7" /> {comm.member_count} Members
                  </span>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleOpenMembers(comm)} className="btn btn-secondary btn-sm">
                      <UserCheck size={14} /> Members
                    </button>

                    {comm.is_member ? (
                      <>
                        {!isActive && (
                          <button onClick={() => selectCommunity(comm)} className="btn btn-primary btn-sm">
                            Set Active
                          </button>
                        )}
                        <button onClick={() => handleLeave(comm.id)} className="btn btn-secondary btn-sm" style={{ color: '#e11d48', borderColor: '#fecdd3' }}>
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
              <h3 className="modal-title">Create Community Network</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Community Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Pinelands Neighborhood Watch"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Community Category</label>
                <select
                  className="form-select"
                  value={newCommunity.community_type}
                  onChange={(e) => setNewCommunity({ ...newCommunity, community_type: e.target.value })}
                >
                  <option value="RESIDENTIAL">Residential Neighborhood Watch</option>
                  <option value="APARTMENT">Apartment Complex / Gated Estate</option>
                  <option value="CAMPUS">University / Student Campus</option>
                  <option value="VILLAGE">Village / Rural District</option>
                  <option value="BUSINESS">Business Improvement District</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe your community's purpose and neighborhood boundaries..."
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Cape Town"
                    value={newCommunity.city}
                    onChange={(e) => setNewCommunity({ ...newCommunity, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Suburb</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pinelands"
                    value={newCommunity.suburb}
                    onChange={(e) => setNewCommunity({ ...newCommunity, suburb: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
              <button onClick={() => setShowMembersModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {members.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>No members registered yet.</p>
              ) : (
                members.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                        {m.user_detail?.first_name ? `${m.user_detail.first_name} ${m.user_detail.last_name || ''}` : m.user_detail?.email}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                        Role: <strong>{m.role}</strong> | Status: <strong style={{ color: m.status === 'APPROVED' ? '#059669' : '#d97706' }}>{m.status}</strong>
                      </div>
                    </div>

                    {user?.id === showMembersModal.created_by && m.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
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
