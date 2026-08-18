import React, { useState, useEffect } from 'react';
import { MessageSquare, Image, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { communityService } from '../services/api';
import FeedPostCard from '../components/FeedPostCard';

function FeedPage() {
  const { user, activeCommunity, userCommunities } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(activeCommunity?.id || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, [activeCommunity]);

  const fetchFeed = async () => {
    try {
      const commId = activeCommunity?.id || '';
      const res = await communityService.getFeed(commId);
      const list = res.data?.results || res.data || [];
      setPosts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const commId = selectedCommunity || activeCommunity?.id || userCommunities[0]?.id;
    if (!commId) {
      alert('Please select a community to post in.');
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await communityService.createFeedPost({
        community: commId,
        content: content,
        image_url: imageUrl || null
      });
      setContent('');
      setImageUrl('');
      fetchFeed();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  const userInit = (user?.first_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Discussion Feed</h1>
          <p className="page-subtitle">Connect, discuss, and share neighbourhood updates in real-time</p>
        </div>
      </div>

      {/* Create Post Box */}
      <div className="card" style={{ marginBottom: '28px', borderTop: '4px solid #0284c7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}>
            {userInit}
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Create Community Post</span>
        </div>

        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <select
              className="form-select"
              value={selectedCommunity || activeCommunity?.id || ''}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              required
              style={{ marginBottom: '12px', fontWeight: '500' }}
            >
              <option value="">Posting in: Select Target Community</option>
              {userCommunities.map(c => (
                <option key={c.id} value={c.id}>📍 {c.name}</option>
              ))}
            </select>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="What's happening in your neighbourhood today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ fontSize: '0.95rem' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '240px' }}>
              <Image size={18} color="#0284c7" />
              <input
                type="url"
                className="form-input"
                style={{ fontSize: '0.825rem' }}
                placeholder="Image URL attachment (optional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ gap: '6px' }}>
              <Send size={16} /> {submitting ? 'Publishing...' : 'Publish Update'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed List Stream */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading community discussion feed...</div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
          <MessageSquare size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: '600' }}>No posts in the feed yet</p>
          <span style={{ fontSize: '0.85rem' }}>Be the first resident to start a conversation!</span>
        </div>
      ) : (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

export default FeedPage;
