import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
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

  const getIcon = (type) => {
    switch (type) {
      case 'EMERGENCY':
        return <ShieldAlert size={16} color="#e11d48" />;
      case 'INCIDENT':
        return <AlertTriangle size={16} color="#d97706" />;
      default:
        return <Info size={16} color="#0284c7" />;
    }
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '420px',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
          borderLeft: '1px solid var(--color-border)',
          animation: 'slideLeft 0.25s ease'
        }}
      >
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Bell size={20} color="#0284c7" />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0 }}>Notification Center</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Community updates & alerts</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {notifications.filter(n => !n.read_status).length} Unread
          </span>
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ gap: '4px', fontSize: '0.775rem' }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
              <Bell size={36} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>No notifications found</p>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>You are all caught up!</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  marginBottom: '10px',
                  backgroundColor: n.read_status ? '#ffffff' : '#f0f9ff',
                  border: '1px solid ' + (n.read_status ? '#e2e8f0' : '#bae6fd'),
                  boxShadow: n.read_status ? 'none' : '0 2px 8px rgba(2, 132, 199, 0.08)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getIcon(n.notification_type)}
                    <span className={`badge badge-${n.notification_type === 'EMERGENCY' ? 'danger' : 'info'}`}>
                      {n.notification_type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(n.date_sent).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', margin: '4px 0 2px' }}>{n.title}</h4>
                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: '1.4', margin: 0 }}>{n.message}</p>
                {!n.read_status && (
                  <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Mark as read →
                    </button>
                  </div>
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
