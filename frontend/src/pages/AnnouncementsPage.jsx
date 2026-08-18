import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Pin, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/api';
import AnnouncementCard from '../components/AnnouncementCard';

function AnnouncementsPage() {
  const { activeCommunity, userCommunities, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    community: activeCommunity?.id || '',
    title: '',
    content: '',
    is_pinned: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [activeCommunity, search]);

  const fetchAnnouncements = async () => {
    try {
      const commId = activeCommunity?.id || '';
      const res = await announcementService.getAnnouncements({ community: commId, search });
      const list = res.data?.results || res.data || [];
      setAnnouncements(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const commId = formData.community || activeCommunity?.id || userCommunities[0]?.id;
    if (!commId) {
      alert('Please select a community.');
      return;
    }
    try {
      await announcementService.createAnnouncement({ ...formData, community: commId });
      setShowCreateModal(false);
      setFormData({ community: activeCommunity?.id || '', title: '', content: '', is_pinned: false });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to publish announcement.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await announcementService.deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Announcements</h1>
          <p className="page-subtitle">Official verified notices, advisories, and neighborhood bulletins</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={16} /> Publish Notice
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search announcements by title, keyword, or community..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '44px', height: '46px', fontSize: '0.925rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
          <Megaphone size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: '600' }}>No announcements found</p>
          <span style={{ fontSize: '0.85rem' }}>Check back later or change your search query.</span>
        </div>
      ) : (
        announcements.map((a) => (
          <AnnouncementCard
            key={a.id}
            announcement={a}
            onDelete={user?.role === 'COMMUNITY_ADMIN' || user?.id === a.created_by ? handleDelete : null}
          />
        ))
      )}

      {/* Publish Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Publish Official Notice</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Target Community *</label>
                <select
                  className="form-select"
                  value={formData.community || activeCommunity?.id || ''}
                  onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                  required
                >
                  <option value="">Select Community</option>
                  {userCommunities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Scheduled Water Maintenance & Safety Advisory"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Details *</label>
                <textarea
                  className="form-textarea"
                  rows="5"
                  required
                  placeholder="Provide complete message details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="pinCheck" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: '600', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pin size={14} /> Pin to top of Community Notice Board
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementsPage;
