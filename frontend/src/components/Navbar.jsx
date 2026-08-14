import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import SOSButton from './SOSButton';
import NotificationDrawer from './NotificationDrawer';

function Navbar() {
  const { user, logout, userCommunities, activeCommunity, selectCommunity } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      const list = res.data?.results || res.data || [];
      const unread = list.filter(n => !n.read_status).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ background: '#1e293b', color: '#ffffff', borderBottom: '1px solid #334155' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '700', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Community Cloud
          </Link>

          {user && userCommunities.length > 0 && (
            <select
              value={activeCommunity?.id || ''}
              onChange={(e) => {
                const comm = userCommunities.find(c => c.id === parseInt(e.target.value));
                selectCommunity(comm || null);
              }}
              style={{
                backgroundColor: '#334155',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Communities</option>
              {userCommunities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: isActive('/') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Dashboard
            </Link>
            <Link to="/communities" style={{ color: isActive('/communities') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Communities
            </Link>
            <Link to="/announcements" style={{ color: isActive('/announcements') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Announcements
            </Link>
            <Link to="/incidents" style={{ color: isActive('/incidents') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Incidents
            </Link>
            <Link to="/emergency" style={{ color: isActive('/emergency') ? '#ef4444' : '#f87171', fontSize: '0.875rem', fontWeight: '600' }}>
              Emergency SOS
            </Link>
            <Link to="/events" style={{ color: isActive('/events') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Events
            </Link>
            <Link to="/feed" style={{ color: isActive('/feed') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Feed
            </Link>
            <Link to="/services" style={{ color: isActive('/services') ? '#38bdf8' : '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
              Services & Lost+Found
            </Link>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'transparent',
                border: '1px solid #475569',
                color: '#ffffff',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              Notifications {unreadCount > 0 && <span style={{ background: '#dc2626', color: '#fff', padding: '1px 5px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '4px' }}>{unreadCount}</span>}
            </button>

            <SOSButton />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
              <Link to="/profile" style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '500' }}>
                {user.first_name || user.email}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </nav>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', backgroundColor: '#2563eb' }}>
              Register
            </Link>
          </div>
        )}
      </div>

      {showNotifications && (
        <NotificationDrawer
          onClose={() => {
            setShowNotifications(false);
            fetchNotifications();
          }}
        />
      )}
    </header>
  );
}

export default Navbar;
