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
  ChevronDown
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

  const navItemStyle = (path, isEmergency = false) => {
    const active = isActive(path);
    if (isEmergency) {
      return {
        color: active ? '#ffffff' : '#f43f5e',
        backgroundColor: active ? '#e11d48' : 'rgba(225, 29, 72, 0.1)',
        border: '1px solid rgba(225, 29, 72, 0.3)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none',
        transition: 'all 0.2s ease'
      };
    }
    return {
      color: active ? '#38bdf8' : '#94a3b8',
      backgroundColor: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
      border: active ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: active ? '600' : '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      textDecoration: 'none',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <header style={{
      background: '#0b0f19',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Community Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', textDecoration: 'none', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)'
            }}>
              <ShieldAlert size={20} color="#ffffff" />
            </div>
            <span>Community<span style={{ color: '#38bdf8' }}>Cloud</span></span>
          </Link>

          {user && userCommunities.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={activeCommunity?.id || ''}
                onChange={(e) => {
                  const comm = userCommunities.find(c => c.id === parseInt(e.target.value));
                  selectCommunity(comm || null);
                }}
                style={{
                  backgroundColor: '#151d2a',
                  color: '#e2e8f0',
                  border: '1px solid #2a3649',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.825rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">🌐 All Communities</option>
                {userCommunities.map(c => (
                  <option key={c.id} value={c.id}>📍 {c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/" style={navItemStyle('/')}>
              <Home size={15} /> Dashboard
            </Link>
            <Link to="/communities" style={navItemStyle('/communities')}>
              <Users size={15} /> Communities
            </Link>
            <Link to="/announcements" style={navItemStyle('/announcements')}>
              <Megaphone size={15} /> Announcements
            </Link>
            <Link to="/incidents" style={navItemStyle('/incidents')}>
              <AlertTriangle size={15} /> Incidents
            </Link>
            <Link to="/emergency" style={navItemStyle('/emergency', true)}>
              <ShieldAlert size={15} /> SOS Emergency
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

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: showNotifications ? '#1e293b' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '4px',
                transition: 'all 0.2s ease'
              }}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  background: '#e11d48',
                  color: '#fff',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '0.725rem',
                  fontWeight: '700',
                  boxShadow: '0 0 8px rgba(225, 29, 72, 0.5)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* SOS Panic Trigger Modal Button */}
            <SOSButton />

            {/* User Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '12px' }}>
              <Link to="/profile" style={{
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                background: '#151d2a',
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1px solid #2a3649'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {(user.first_name ? user.first_name[0] : user.email[0]).toUpperCase()}
                </div>
                <span>{user.first_name || user.email.split('@')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </nav>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
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
