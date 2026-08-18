import React, { useState } from 'react';
import { MessageSquare, Send, User, Image as ImageIcon } from 'lucide-react';
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

  const authorInit = (post.author_detail?.first_name || post.author_detail?.email || 'U')[0].toUpperCase();

  return (
    <div className="card card-interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.95rem',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
          }}>
            {authorInit}
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
              {post.author_detail?.first_name ? `${post.author_detail.first_name} ${post.author_detail.last_name || ''}` : post.author_detail?.email}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {new Date(post.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'pre-line', margin: '12px 0', lineHeight: '1.6' }}>
        {post.content}
      </p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post attachment"
          style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px', border: '1px solid #e2e8f0' }}
        />
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0284c7',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background-color 0.15s ease'
          }}
        >
          <MessageSquare size={16} />
          <span>{showComments ? 'Hide Discussion' : `Comments (${comments.length})`}</span>
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #cbd5e1' }}>
          {comments.length === 0 ? (
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
              No comments posted yet. Join the conversation!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.775rem', fontWeight: '700', color: '#0284c7', marginBottom: '2px' }}>
                  {c.author_detail?.first_name || c.author_detail?.email || 'Resident'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>{c.comment}</div>
              </div>
            ))
          )}

          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Write a community reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ fontSize: '0.85rem', borderRadius: '20px', padding: '8px 16px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} style={{ borderRadius: '20px', padding: '8px 16px', gap: '4px' }}>
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default FeedPostCard;
