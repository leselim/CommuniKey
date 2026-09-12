import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { notifications as demoNotifications } from '../services/demoData';
import { save } from '../services/api';
import { formatRelative } from '../utils/format';
import Icon from './Icon';

/*
 * Notification tray.
 *
 * Unread items carry a red dot and full weight type. Opening an item marks it
 * read, closes the tray and takes you to the screen it is about.
 */

function Notifications() {
  const { items, setItems } = useCollection('/notifications', demoNotifications);
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClickAway = (event) => {
      if (wrapper.current && !wrapper.current.contains(event.target)) setOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const unread = items.filter((item) => !item.read_status);

  const markRead = async (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read_status: true } : item)));
    await save(`/notifications/${id}/read`, {}, 'put');
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, read_status: true })));
    await Promise.all(unread.map((item) => save(`/notifications/${item.id}/read`, {}, 'put')));
  };

  const handleNotificationClick = async (item) => {
    if (!item.read_status) {
      await markRead(item.id);
    }
    setOpen(false);

    const type = (item.notification_type || '').toLowerCase();
    const title = (item.title || '').toLowerCase();

    if (type === 'incident' || title.includes('incident') || title.includes('suspicious')) {
      if (userRole === 'Safety Volunteer') navigate('/volunteer/triage');
      else if (userRole === 'Estate Administrator') navigate('/admin/incidents');
      else navigate('/incidents');
    } else if (type === 'announcement' || title.includes('announcement') || title.includes('meeting') || title.includes('notice')) {
      if (userRole === 'Estate Administrator') navigate('/admin/announcements');
      else navigate('/announcements');
    } else if (type === 'event' || title.includes('event') || title.includes('reminder') || title.includes('clean-up')) {
      navigate('/events');
    } else if (type === 'member' || title.includes('member') || title.includes('verification')) {
      if (userRole === 'Estate Administrator') navigate('/admin/moderation');
      else navigate('/profile');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="account" ref={wrapper}>
      <button
        type="button"
        className="icon-btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread.length > 0 ? `Notifications, ${unread.length} unread` : 'Notifications, none unread'}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" />
        {unread.length > 0 ? <span className="count">{unread.length}</span> : null}
      </button>

      {open ? (
        <div className="popover tray">
          <div className="tray-head">
            <h2>Notifications</h2>
            {unread.length > 0 ? (
              <button type="button" className="text-btn" onClick={markAllRead}>
                Mark all as read
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="tray-empty">You are all caught up.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tray-item${item.read_status ? '' : ' new'}`}
                onClick={() => handleNotificationClick(item)}
              >
                <span className="tray-flag" aria-hidden="true" />
                <span className="tray-title">{item.title}</span>
                <span className="tray-time">{formatRelative(item.date_sent)}</span>
                <span className="tray-text">{item.message}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Notifications;
