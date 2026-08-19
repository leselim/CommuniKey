import React, { useEffect, useRef, useState } from 'react';
import useCollection from '../hooks/useCollection';
import { notifications as demoNotifications } from '../services/demoData';
import { save } from '../services/api';
import { formatRelative } from '../utils/format';

function Notifications() {
  const { items, setItems } = useCollection('/notifications', demoNotifications);
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
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read_status: true } : item))
    );
    await save(`/notifications/${id}/read`, {}, 'put');
  };

  return (
    <div className="notify" ref={wrapper}>
      <button
        type="button"
        className="notify-btn"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Notifications
        {unread.length ? <span className="notify-count">{unread.length}</span> : null}
      </button>

      {open ? (
        <div className="tray">
          <div className="tray-head">
            <p className="eyebrow">Notifications</p>
            {unread.length ? (
              <button
                type="button"
                className="link"
                onClick={() => unread.forEach((item) => markRead(item.id))}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="blank">No notifications.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tray-item${item.read_status ? '' : ' new'}`}
                onClick={() => markRead(item.id)}
              >
                <span
                  className={`tray-flag${item.read_status ? ' read' : ''}`}
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
