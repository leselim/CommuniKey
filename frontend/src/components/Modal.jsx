import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Prevent background scrolling while modal is active
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-head">
          <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            className="link sm"
            onClick={onClose}
            style={{ color: 'var(--dim)', textDecoration: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            aria-label="Close modal dialog"
          >
            ✕ Close
          </button>
        </div>
        <div className="dialog-body">{children}</div>
        {footer ? <div className="dialog-foot">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
