import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';

function NotificationDrawer({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      const list = res.data?.results || res.data || [];
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read_status: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '400px',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.15)'
        }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Notifications</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            Mark all as read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', marginTop: '32px' }}>No notifications found.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  backgroundColor: n.read_status ? '#ffffff' : '#f0f9ff',
                  border: '1px solid ' + (n.read_status ? '#e2e8f0' : '#bae6fd')
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge badge-${n.notification_type === 'EMERGENCY' ? 'danger' : 'info'}`}>
                    {n.notification_type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(n.date_sent).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginTop: '6px' }}>{n.title}</h4>
                <p style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px' }}>{n.message}</p>
                {!n.read_status && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginTop: '6px',
                      padding: 0
                    }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDrawer;
