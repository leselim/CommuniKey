import React, { useState } from 'react';
import { communityService } from '../services/api';

function FeedPostCard({ post }) {
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await communityService.addComment(post.id, commentText);
      const newComment = res.data?.data || res.data;
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}>
            {(post.author_detail?.first_name || post.author_detail?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {post.author_detail?.first_name ? `${post.author_detail.first_name} ${post.author_detail.last_name || ''}` : post.author_detail?.email}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.925rem', color: '#1e293b', whiteSpace: 'pre-line', margin: '12px 0' }}>
        {post.content}
      </p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post attachment"
          style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }}
        />
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}
        >
          {showComments ? 'Hide Comments' : `Comments (${comments.length})`}
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
          {comments.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '4px', marginBottom: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>
                  {c.author_detail?.first_name || c.author_detail?.email || 'User'}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#1e293b' }}>{c.comment}</div>
              </div>
            ))
          )}

          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default FeedPostCard;
