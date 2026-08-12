import React, { useState, useEffect } from 'react';
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
          <p className="page-subtitle">Official communications and notices</p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          + Publish Announcement
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search announcements by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No announcements found.</p>
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
              <h3 className="modal-title">Publish Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Community *</label>
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                />
                <label htmlFor="pinCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Pin to top of Community Board</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Announcement
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
