import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communityService } from '../services/api';
import FeedPostCard from '../components/FeedPostCard';

function FeedPage() {
  const { activeCommunity, userCommunities } = useAuth();
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

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Discussion Feed</h1>
          <p className="page-subtitle">Connect, discuss, and share updates with neighbours</p>
        </div>
      </div>

      {/* Create Post Box */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <select
              className="form-select"
              value={selectedCommunity || activeCommunity?.id || ''}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              required
              style={{ marginBottom: '10px' }}
            >
              <option value="">Posting in: Select Community</option>
              {userCommunities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="What's happening in the neighbourhood?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="url"
              className="form-input"
              style={{ maxWidth: '280px', fontSize: '0.8rem' }}
              placeholder="Attachment image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed List */}
      {loading ? (
        <p>Loading community feed...</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', marginTop: '24px' }}>
          No posts in the feed yet. Start the conversation!
        </p>
      ) : (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

export default FeedPage;
