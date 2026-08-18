import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, Info, ShieldAlert, ChevronRight } from 'lucide-react';
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
        return <ShieldAlert size={15} color="#dc2626" />;
      case 'INCIDENT':
        return <AlertTriangle size={15} color="#d97706" />;
      default:
        return <Info size={15} color="#1e40af" />;
    }
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '380px',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
          borderLeft: '1px solid var(--color-border)'
        }}
      >
        <div className="modal-header" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#0f172a" />
            <h3 className="modal-title" style={{ margin: 0, fontSize: '1.05rem' }}>Notifications</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
            {notifications.filter(n => !n.read_status).length} Unread Alerts
          </span>
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ gap: '4px', fontSize: '0.75rem' }}>
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Bell size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>No notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  backgroundColor: n.read_status ? '#ffffff' : '#f8fafc',
                  border: '1px solid ' + (n.read_status ? '#e2e8f0' : '#cbd5e1')
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getIcon(n.notification_type)}
                    <span className={`badge badge-${n.notification_type === 'EMERGENCY' ? 'danger' : 'info'}`}>
                      {n.notification_type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                    {new Date(n.date_sent).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', margin: '4px 0 2px' }}>{n.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4', margin: 0 }}>{n.message}</p>
                {!n.read_status && (
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: 0
                      }}
                    >
                      Mark as read <ChevronRight size={12} />
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
