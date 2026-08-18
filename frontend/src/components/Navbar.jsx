import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Megaphone,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Wrench,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const navItemStyle = (path, isEmergency = false) => {
    const active = isActive(path);
    if (isEmergency) {
      return {
        color: active ? '#ffffff' : '#dc2626',
        backgroundColor: active ? '#dc2626' : 'rgba(220, 38, 38, 0.08)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '0.825rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none'
      };
    }
    return {
      color: active ? '#0f172a' : '#475569',
      backgroundColor: active ? '#f1f5f9' : 'transparent',
      border: '1px solid transparent',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '0.825rem',
      fontWeight: active ? '600' : '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      textDecoration: 'none'
    };
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand & Community Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ color: '#0f172a', fontSize: '1.15rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '6px', borderRadius: '6px', display: 'flex' }}>
              <ShieldAlert size={18} />
            </div>
            <span>Pinelands Community</span>
          </Link>

          {user && userCommunities.length > 0 && (
            <select
              value={activeCommunity?.id || ''}
              onChange={(e) => {
                const comm = userCommunities.find(c => c.id === parseInt(e.target.value));
                selectCommunity(comm || null);
              }}
              style={{
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.8rem',
                fontWeight: '500',
                outline: 'none',
                maxWidth: '180px'
              }}
            >
              <option value="">Pinelands Focus</option>
              {userCommunities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Desktop Navigation */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
              <Link to="/" style={navItemStyle('/')}>
                <Home size={15} /> Dashboard
              </Link>
              <Link to="/communities" style={navItemStyle('/communities')}>
                <Users size={15} /> Communities
              </Link>
              <Link to="/announcements" style={navItemStyle('/announcements')}>
                <Megaphone size={15} /> Notices
              </Link>
              <Link to="/incidents" style={navItemStyle('/incidents')}>
                <AlertTriangle size={15} /> Incidents
              </Link>
              <Link to="/emergency" style={navItemStyle('/emergency', true)}>
                <ShieldAlert size={15} /> SOS
              </Link>
              <Link to="/events" style={navItemStyle('/events')}>
                <Calendar size={15} /> Events
              </Link>
              <Link to="/feed" style={navItemStyle('/feed')}>
                <MessageSquare size={15} /> Feed
              </Link>
              <Link to="/services" style={navItemStyle('/services')}>
                <Wrench size={15} /> Directory
              </Link>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: showNotifications ? '#f1f5f9' : 'transparent',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{ background: '#dc2626', color: '#fff', padding: '1px 5px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <SOSButton />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                <Link to="/profile" style={{
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  background: '#f8fafc',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1'
                }}>
                  <User size={14} />
                  <span>{user.first_name || user.email.split('@')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex'
                  }}
                  title="Log out"
                >
                  <LogOut size={14} />
                </button>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'none'
                }}
                className="mobile-toggle"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {user && mobileMenuOpen && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" style={navItemStyle('/')}>
            <Home size={15} /> Dashboard
          </Link>
          <Link to="/communities" style={navItemStyle('/communities')}>
            <Users size={15} /> Communities
          </Link>
          <Link to="/announcements" style={navItemStyle('/announcements')}>
            <Megaphone size={15} /> Notices
          </Link>
          <Link to="/incidents" style={navItemStyle('/incidents')}>
            <AlertTriangle size={15} /> Incidents
          </Link>
          <Link to="/emergency" style={navItemStyle('/emergency', true)}>
            <ShieldAlert size={15} /> Emergency SOS
          </Link>
          <Link to="/events" style={navItemStyle('/events')}>
            <Calendar size={15} /> Events
          </Link>
          <Link to="/feed" style={navItemStyle('/feed')}>
            <MessageSquare size={15} /> Feed
          </Link>
          <Link to="/services" style={navItemStyle('/services')}>
            <Wrench size={15} /> Directory
          </Link>
        </div>
      )}

      {showNotifications && (
        <NotificationDrawer
          onClose={() => {
            setShowNotifications(false);
            fetchNotifications();
          }}
        />
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

export default Navbar;
