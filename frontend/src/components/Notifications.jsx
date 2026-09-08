import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { notifications as demoNotifications } from '../services/demoData';
import { save } from '../services/api';
import { formatRelative } from '../utils/format';

/*
 * Notification tray.
 *
 * Unread status is indicated by a signal dot in the left gutter and full
 * contrast typography. Clicking any notification marks it read, closes the tray,
 * and navigates directly to the relevant platform view.
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
      if (userRole === 'Safety Volunteer') {
        navigate('/volunteer/triage');
      } else if (userRole === 'Estate Administrator') {
        navigate('/admin/incidents');
      } else {
        navigate('/incidents');
      }
    } else if (type === 'announcement' || title.includes('announcement') || title.includes('meeting') || title.includes('notice')) {
      if (userRole === 'Estate Administrator') {
        navigate('/admin/announcements');
      } else {
        navigate('/announcements');
      }
    } else if (type === 'event' || title.includes('event') || title.includes('reminder') || title.includes('clean-up')) {
      navigate('/events');
    } else if (type === 'member' || title.includes('member') || title.includes('verification')) {
      if (userRole === 'Estate Administrator') {
        navigate('/admin/moderation');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="notify" ref={wrapper}>
      <button
        type="button"
        className="notify-btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unread.length > 0
            ? `Notifications, ${unread.length} unread`
            : 'Notifications, none unread'
        }
        onClick={() => setOpen((value) => !value)}
      >
        Notifications
        {unread.length > 0 ? <span className="notify-count">{unread.length}</span> : null}
      </button>

      {open ? (
        <div className="tray">
          <div className="tray-head">
            <h2>Notifications</h2>
            {unread.length > 0 ? (
              <button type="button" className="link" onClick={markAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="tray-empty">Nothing new.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tray-item${item.read_status ? '' : ' new'}`}
                onClick={() => handleNotificationClick(item)}
              >
                <span
                  className={`tray-flag${item.read_status ? ' read' : ' unread'}`}
                  aria-hidden="true"
                />
                <span className="tray-title">{item.title}</span>
                <span className="tray-text">{item.message}</span>
                <span className="tray-time">{formatRelative(item.date_sent)}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Notifications;
